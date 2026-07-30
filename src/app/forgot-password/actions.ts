"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { getSiteUrl } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

const emailSchema = z.object({ email: z.string().trim().email() });

export type ResetRequestResult = { ok: true } | { ok: false; error: string };

export async function requestPasswordReset(formData: FormData): Promise<ResetRequestResult> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };

  const { email } = parsed.data;

  // Same generic response whether the account exists or not, so this
  // can't be used to check which emails have accounts on the site.
  const genericSuccess: ResetRequestResult = { ok: true };

  const { success: withinLimit } = rateLimit(`password-reset:${email}`, 3, 15 * 60_000);
  if (!withinLimit) return genericSuccess;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return genericSuccess;

    const resetToken = await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    const resetUrl = `${getSiteUrl()}/reset-password/${resetToken.token}`;

    if (process.env.BREVO_API_KEY) {
      await sendBrevoEmail({
        to: [{ email: user.email, name: user.name }],
        subject: "Reset your password",
        htmlContent: `<p>Hi ${user.name.split(" ")[0]}, click the link below to set a new password. This link expires in one hour.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      });
    }

    return genericSuccess;
  } catch (err) {
    console.error("[forgot-password] failed", err);
    return genericSuccess;
  }
}

const resetSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export type ResetCompleteResult = { ok: true } | { ok: false; error: string };

export async function completePasswordReset(formData: FormData): Promise<ResetCompleteResult> {
  const parsed = resetSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { token, newPassword } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { ok: false, error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  return { ok: true };
}
