"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral-code";

const partnerSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type PartnerSignupResult = { ok: true } | { ok: false; error: string };

export async function createReferralPartnerAccount(formData: FormData): Promise<PartnerSignupResult> {
  const parsed = partnerSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateReferralCode(name);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "REFERRER" },
    });

    await prisma.referralPartner.create({
      data: { userId: user.id, referralCode },
    });

    return { ok: true };
  } catch (err) {
    console.error("[partner signup] failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
