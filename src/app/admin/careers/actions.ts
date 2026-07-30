"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

const jobSchema = z.object({
  title: z.string().trim().min(2).max(150),
  department: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().min(1).max(100),
  type: z.string().trim().min(1).max(50),
  description: z.string().trim().min(10),
  requirements: z.string().trim().optional().or(z.literal("")),
});

export async function createJob(formData: FormData) {
  await requireAdmin();

  const parsed = jobSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const data = parsed.data;

  await prisma.job.create({
    data: {
      ...data,
      department: data.department || null,
      requirements: data.requirements || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  redirect("/admin/careers");
}

export async function updateJob(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing job id.");

  const parsed = jobSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const data = parsed.data;

  await prisma.job.update({
    where: { id },
    data: {
      ...data,
      department: data.department || null,
      requirements: data.requirements || null,
      active: formData.get("active") === "on",
    },
  });

  revalidatePath("/admin/careers");
  revalidatePath("/careers");
  redirect("/admin/careers");
}

export async function toggleJobActive(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const active = formData.get("active") === "true";
  if (typeof id !== "string") throw new Error("Missing job id.");

  await prisma.job.update({ where: { id }, data: { active: !active } });
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
}

export async function deleteJob(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing job id.");

  await prisma.job.delete({ where: { id } });
  revalidatePath("/admin/careers");
  revalidatePath("/careers");
}
