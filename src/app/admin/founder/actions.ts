"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

const founderSchema = z.object({
  name: z.string().trim().min(2).max(150),
  role: z.string().trim().min(2).max(150),
  bio: z.string().trim().min(2),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  githubUrl: z.string().trim().url().optional().or(z.literal("")),
  linkedinUrl: z.string().trim().url().optional().or(z.literal("")),
});

// Singleton: there's only ever one Founder row. Update it if it exists,
// create it on first save otherwise, same effect as an upsert without
// needing a fixed known id.
export async function saveFounder(formData: FormData) {
  await requireAdmin();

  const parsed = founderSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const data = {
    name: parsed.data.name,
    role: parsed.data.role,
    bio: parsed.data.bio,
    photoUrl: parsed.data.photoUrl || null,
    githubUrl: parsed.data.githubUrl || null,
    linkedinUrl: parsed.data.linkedinUrl || null,
  };

  const existing = await prisma.founder.findFirst();
  if (existing) {
    await prisma.founder.update({ where: { id: existing.id }, data });
  } else {
    await prisma.founder.create({ data });
  }

  revalidatePath("/admin/founder");
  revalidatePath("/about");
}
