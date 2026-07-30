"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const upsertSchema = z.object({
  page: z.string().trim().min(1),
  key: z.string().trim().min(1),
  value: z.string(),
});

export async function upsertSiteContent(formData: FormData) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }

  const parsed = upsertSchema.safeParse({
    page: formData.get("page"),
    key: formData.get("key"),
    value: formData.get("value"),
  });
  if (!parsed.success) throw new Error("Invalid content payload.");

  const { page, key, value } = parsed.data;

  await prisma.siteContent.upsert({
    where: { page_key: { page, key } },
    create: { page, key, value, updatedBy: session.user.id },
    update: { value, updatedBy: session.user.id },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "UPDATE",
      entity: "SiteContent",
      entityId: `${page}.${key}`,
    },
  });

  revalidatePath("/admin/content");
  revalidatePath("/"); // homepage and other pages read this content live
}

export async function createSiteContentField(formData: FormData) {
  return upsertSiteContent(formData);
}
