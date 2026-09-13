"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getScopingPackage } from "@/lib/data/scoping-book";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

const answerSchema = z.object({
  group: z.string(),
  question: z.string(),
  checked: z.boolean(),
  // No max — comments are meant to hold as much as a call produces.
  comment: z.string(),
});

function parseAnswers(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") throw new Error("Missing answers.");
  try {
    return z.array(answerSchema).parse(JSON.parse(raw));
  } catch {
    throw new Error("Invalid answers.");
  }
}

export async function createClientBrief(formData: FormData) {
  const session = await requireAdmin();
  const clientId = formData.get("clientId");
  const packageKey = formData.get("packageKey");
  if (typeof clientId !== "string" || typeof packageKey !== "string") {
    throw new Error("Missing required fields.");
  }
  const pkg = getScopingPackage(packageKey);
  if (!pkg) throw new Error("Unknown package.");

  const answers = parseAnswers(formData.get("answers"));

  const brief = await prisma.clientBrief.create({
    data: {
      clientId,
      packageKey,
      packageName: packageKey,
      answers,
      createdBy: session.user.email ?? session.user.id,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}/briefs/${brief.id}`);
}

export async function updateClientBrief(formData: FormData) {
  await requireAdmin();
  const briefId = formData.get("briefId");
  const clientId = formData.get("clientId");
  if (typeof briefId !== "string" || typeof clientId !== "string") {
    throw new Error("Missing required fields.");
  }

  const answers = parseAnswers(formData.get("answers"));

  await prisma.clientBrief.update({ where: { id: briefId }, data: { answers } });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath(`/admin/clients/${clientId}/briefs/${briefId}`);
  redirect(`/admin/clients/${clientId}/briefs/${briefId}`);
}

export async function deleteClientBrief(formData: FormData) {
  await requireAdmin();
  const briefId = formData.get("briefId");
  const clientId = formData.get("clientId");
  if (typeof briefId !== "string" || typeof clientId !== "string") throw new Error("Missing id.");

  await prisma.clientBrief.delete({ where: { id: briefId } });

  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}`);
}
