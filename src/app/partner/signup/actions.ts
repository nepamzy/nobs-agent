"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral-code";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildPartnerWelcomeHtml } from "@/lib/partner-email";
import { getSiteUrl } from "@/lib/env";
import { generateReferralAgreementPdf } from "@/lib/referral-agreement-pdf";
import { getReferralPartnerCapacity, getReferralPartnerCount } from "@/lib/referral-partner-capacity";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";

const partnerSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(150),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(20),
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreedToTerms: z.literal("on", "You must agree to the Referral Partner Agreement and Privacy Policy."),
});

export type PartnerSignupResult = { ok: true } | { ok: false; error: string };

// Only resolves to a recruiter id when the program is switched on AND the
// code belongs to a real, non-suspended partner AND that partner isn't
// the same email as the person signing up (no self-recruiting) — anything
// else is a silent no-op, this account still gets created as a normal,
// unrecruited partner rather than failing outright.
async function resolveRecruiterId(refCode: string | null, newUserEmail: string): Promise<string | null> {
  if (!refCode) return null;
  const settings = await getReferralProgramSettings();
  if (!settings.multiLevelReferralsEnabled) return null;

  const recruiter = await prisma.referralPartner.findUnique({
    where: { referralCode: refCode },
    include: { user: true },
  });
  if (!recruiter || recruiter.suspended) return null;
  if (recruiter.user.email.toLowerCase() === newUserEmail.toLowerCase()) return null;

  return recruiter.id;
}

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
    const [currentCount, capacity] = await Promise.all([getReferralPartnerCount(), getReferralPartnerCapacity()]);
    if (currentCount >= capacity) {
      return { ok: false, error: "Referral partner sign-ups are full. All spots are taken right now." };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { ok: false, error: "An account with this email already exists. Try signing in instead." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateReferralCode(name);

    const rawRef = formData.get("ref");
    const recruitedByPartnerId = await resolveRecruiterId(
      typeof rawRef === "string" && rawRef ? rawRef : null,
      email
    );

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, role: "REFERRER" },
    });

    const partner = await prisma.referralPartner.create({
      data: { userId: user.id, referralCode, recruitedByPartnerId },
    });

    if (process.env.BREVO_API_KEY) {
      // Effective Date on the agreement is the real account-creation
      // timestamp, not "today" — matters if this PDF is ever regenerated
      // later (e.g. redownloaded from the dashboard), it must always show
      // the same date it did on day one, not the day it was redownloaded.
      const pdfBytes = await generateReferralAgreementPdf({
        partnerName: name,
        partnerEmail: email,
        partnerPhone: phone,
        effectiveDate: partner.createdAt,
      });
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

      await sendBrevoEmail({
        to: [{ email, name }],
        subject: "Welcome to NOBS Agent",
        htmlContent: buildPartnerWelcomeHtml({
          partnerName: name,
          referralCode,
          referralLink: `${getSiteUrl()}/signup?ref=${referralCode}`,
        }),
        attachment: [{ name: "NOBS-Agent-Referral-Partner-Agreement.pdf", content: pdfBase64 }],
      }).catch((err) => console.error("[partner signup] welcome email failed", err));
    }

    return { ok: true };
  } catch (err) {
    console.error("[partner signup] failed", err);
    return { ok: false, error: "Something went wrong creating your account. Please try again." };
  }
}
