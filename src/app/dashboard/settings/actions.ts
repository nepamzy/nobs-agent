"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().trim().min(2).max(150),
  organization: z.string().trim().max(150).optional().or(z.literal("")),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    organization: formData.get("organization"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { name, organization } = parsed.data;

  await prisma.user.update({ where: { id: session.user.id }, data: { name } });

  const client = await prisma.client.findUnique({ where: { userId: session.user.id } });
  if (client) {
    await prisma.client.update({
      where: { id: client.id },
      data: { name, organization: organization || null },
    });
  }

  revalidatePath("/dashboard/settings");
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match.",
    path: ["confirmPassword"],
  });

export type PasswordResult = { ok: true } | { ok: false; error: string };

export async function changePassword(formData: FormData): Promise<PasswordResult> {
  const session = await auth();
  if (!session) return { ok: false, error: "Not authorized." };

  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Account not found." };

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return { ok: true };
}

export async function updateNotificationPreference(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const emailNotifications = formData.get("emailNotifications") === "on";
  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailNotifications },
  });

  revalidatePath("/dashboard/settings");
}
