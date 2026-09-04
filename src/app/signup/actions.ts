"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const REFERRAL_COOKIE = "nobs_ref";

// Best-effort — a missing/invalid/self-referral code should never block
// account creation, it just means no Referral row gets created. `formCode`
// (read straight from the signup form's hidden field, populated from the
// URL) is the primary, reliable source — the nobs_ref cookie middleware
// sets is a fallback for someone who clicked the link, browsed around,
// and signed up later without the query param still in their URL.
async function linkReferralIfPresent(newUserId: string, newUserEmail: string, formCode: string | null) {
  try {
    const code = formCode || (await cookies()).get(REFERRAL_COOKIE)?.value;
    if (!code) return;

    const partner = await prisma.referralPartner.findUnique({
      where: { referralCode: code },
      include: { user: true },
    });
    if (!partner || partner.suspended) return;
    if (partner.user.email.toLowerCase() === newUserEmail.toLowerCase()) return; // no self-referral

    await prisma.referral.create({
      data: { partnerId: partner.id, referredUserId: newUserId },
    });
  } catch (err) {
    console.error("[signup] referral link failed (non-fatal)", err);
  }
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  organization: z.string().trim().max(150).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignupResult = { ok: true } | { ok: false; error: string };

export async function createClientAccount(formData: FormData): Promise<SignupResult> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    organization: formData.get("organization"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, organization, email, phone, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: "CLIENT",
      },
    });

    // Every client gets a linked Client record on signup, so admin work
    // (attaching projects, testimonials) has somewhere to point immediately.
    await prisma.client.create({
      data: {
        name,
        organization: organization || null,
        userId: user.id,
      },
    });

    const rawRef = formData.get("ref");
    await linkReferralIfPresent(user.id, email, typeof rawRef === "string" && rawRef ? rawRef : null);

    return { ok: true };
  } catch (err) {
    console.error("[signup] failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
