"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildWaitlistJoinedHtml } from "@/lib/partner-email";
import { getSiteUrl } from "@/lib/env";
import { sendPartnerWelcomeEmail } from "@/lib/send-partner-welcome-email";
import { attemptPartnerSignupOrWaitlist } from "@/lib/referral-partner-waitlist";

const partnerSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreedToTerms: z.literal("on", "You must agree to the Referral Partner Agreement and Privacy Policy."),
});

export type PartnerSignupResult =
  | { ok: true; kind: "partner" }
  | { ok: true; kind: "waitlisted"; position: number; statusUrl: string }
  | { ok: false; error: string };

export async function createReferralPartnerAccount(formData: FormData): Promise<PartnerSignupResult> {
  const parsed = partnerSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    agreedToTerms: formData.get("agreedToTerms"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const rawRef = formData.get("ref");
    const refCode = typeof rawRef === "string" && rawRef ? rawRef : null;

    // Never a hard "sorry, full" error at this point — capacity may have
    // been read as full on the page render but freed up by the time this
    // submits, or vice versa. Whichever is true right now, this always
    // resolves to a concrete outcome: a live account or a waitlist spot.
    const outcome = await attemptPartnerSignupOrWaitlist({ name, email, phone, passwordHash, refCode });

    if (outcome.kind === "already_user") {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    if (outcome.kind === "waitlisted" || outcome.kind === "already_waitlisted") {
      const statusUrl = `${getSiteUrl()}/partner/waitlist/${outcome.waitlistId}`;
      if (outcome.kind === "waitlisted" && process.env.BREVO_API_KEY) {
        await sendBrevoEmail({
          to: [{ email: outcome.email, name: outcome.name }],
          subject: "You're on the NOBS Agent referral partner waitlist",
          htmlContent: buildWaitlistJoinedHtml({ name: outcome.name, position: outcome.position, statusUrl }),
        }).catch((err) => console.error("[partner signup] waitlist email failed", err));
      }
      return { ok: true, kind: "waitlisted", position: outcome.position, statusUrl };
    }

    // outcome.kind === "partner"
    await sendPartnerWelcomeEmail({
      name: outcome.name,
      email: outcome.email,
      phone: outcome.phone,
      referralCode: outcome.referralCode,
      createdAt: outcome.createdAt,
    }).catch((err) => console.error("[partner signup] welcome email failed", err));

    return { ok: true, kind: "partner" };
  } catch (err) {
    console.error("[partner signup] failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
