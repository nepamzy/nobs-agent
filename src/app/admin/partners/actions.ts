"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { generateReferralAgreementPdf } from "@/lib/referral-agreement-pdf";
import { updateReferralProgramSettings } from "@/lib/referral-program-settings";
import { getReferralPartnerCapacity, getReferralPartnerCount } from "@/lib/referral-partner-capacity";
import { lockReferralPartnerCapacity } from "@/lib/referral-partner-lock";
import { suspendPartnerAndPromoteNext } from "@/lib/referral-partner-suspension";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

export async function togglePartnerSuspended(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const wasSuspended = formData.get("suspended") === "true";
  if (typeof id !== "string") throw new Error("Missing partner id.");

  const newSuspended = !wasSuspended;

  if (newSuspended) {
    // Dropping a partner frees a seat — flip it, then offer that seat to
    // whoever's been waiting longest on the waitlist. A manual admin
    // suspend doesn't email the partner (assumed already communicated
    // directly); the automated inactivity path does — see
    // suspendPartnerAndPromoteNext.
    const partner = await prisma.referralPartner.findUnique({ where: { id }, include: { user: true } });
    if (!partner) throw new Error("Partner not found.");

    await suspendPartnerAndPromoteNext({
      partnerId: id,
      partnerName: partner.user.name,
      partnerEmail: partner.user.email,
      reason: "manual",
    });
  } else {
    // Reactivating — locked so this can't race a concurrent promotion
    // that just took the seat this partner is trying to come back into.
    await prisma.$transaction(
      async (tx) => {
        await lockReferralPartnerCapacity(tx);
        const [count, capacity] = await Promise.all([getReferralPartnerCount(tx), getReferralPartnerCapacity()]);
        if (count >= capacity) {
          throw new Error(
            `Can't reactivate — all ${capacity} spots are currently filled. Raise the slot count on this page first if you want to bring them back.`
          );
        }
        await tx.referralPartner.update({ where: { id }, data: { suspended: false } });
      },
      { timeout: 15000 }
    );
  }

  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${id}`);
}

const disqualifySchema = z.object({
  referralId: z.string().min(1),
  reason: z.string().trim().min(3, "Give a short reason.").max(500),
});

export async function disqualifyReferral(formData: FormData) {
  await requireAdmin();
  const parsed = disqualifySchema.safeParse({
    referralId: formData.get("referralId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const referral = await prisma.referral.update({
    where: { id: parsed.data.referralId },
    data: { status: "DISQUALIFIED", disqualifiedReason: parsed.data.reason },
  });
  revalidatePath(`/admin/partners/${referral.partnerId}`);
}

export async function reinstateReferral(formData: FormData) {
  await requireAdmin();
  const id = formData.get("referralId");
  if (typeof id !== "string") throw new Error("Missing referral id.");

  const referral = await prisma.referral.update({
    where: { id },
    data: { status: "PENDING", disqualifiedReason: null },
  });
  revalidatePath(`/admin/partners/${referral.partnerId}`);
}

export type ResendAgreementResult =
  | { ok: true; skipped: false }
  // Email sending is configured OFF (no BREVO_API_KEY) on this deployment —
  // the PDF was generated fine, but nothing was actually emailed. Distinct
  // from a real failure so the admin isn't told "Sent!" when nothing sent.
  | { ok: true; skipped: true }
  | { ok: false; error: string };

export async function resendPartnerAgreement(formData: FormData): Promise<ResendAgreementResult> {
  try {
    await requireAdmin();
  } catch {
    return { ok: false, error: "Not authorized." };
  }

  const id = formData.get("id");
  if (typeof id !== "string") return { ok: false, error: "Missing partner id." };

  const partner = await prisma.referralPartner.findUnique({ where: { id }, include: { user: true } });
  if (!partner) return { ok: false, error: "Partner not found." };

  try {
    // Covers accounts created before this feature existed (their Effective
    // Date will show their real, already-past account-creation date, same
    // as it would if they'd downloaded it from their dashboard themselves).
    const pdfBytes = await generateReferralAgreementPdf({
      partnerName: partner.user.name,
      partnerEmail: partner.user.email,
      partnerPhone: partner.user.phone ?? "",
      effectiveDate: partner.createdAt,
    });
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    const result = await sendBrevoEmail({
      to: [{ email: partner.user.email, name: partner.user.name }],
      subject: "Your NOBS Agent Referral Partner Agreement",
      htmlContent: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; border: 1px solid #e4b34355; padding: 32px; color: #12151d;">
          <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a5822f; margin: 0 0 4px;">NOBS AGENT</p>
          <h1 style="font-size: 22px; margin: 0 0 24px;">Your Referral Partner Agreement</h1>
          <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
            Hi ${partner.user.name}, your Referral Partner Agreement is attached, filled in with your
            details. Please review, sign, and send a scanned or photographed copy back to
            nobsagent0@gmail.com.
          </p>
          <p style="font-family: Arial, sans-serif; font-size: 11px; color: #999; margin-top: 32px;">
            NOBS AGENT &middot; Kaduna, Nigeria, remote-first &middot; nobsagent0@gmail.com
          </p>
        </div>
      `,
      attachment: [{ name: "NOBS-Agent-Referral-Partner-Agreement.pdf", content: pdfBase64 }],
    });

    const skipped = Boolean(result && typeof result === "object" && "skipped" in result && result.skipped);
    return skipped ? { ok: true, skipped: true } : { ok: true, skipped: false };
  } catch (err) {
    console.error("[resendPartnerAgreement] failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send the agreement email." };
  }
}

export async function markCommissionPaidOut(formData: FormData) {
  await requireAdmin();
  const id = formData.get("commissionId");
  const partnerId = formData.get("partnerId");
  if (typeof id !== "string") throw new Error("Missing commission id.");

  await prisma.referralCommission.update({
    where: { id },
    data: { paidOut: true, paidOutAt: new Date() },
  });
  if (typeof partnerId === "string") revalidatePath(`/admin/partners/${partnerId}`);
}

const settingsSchema = z.object({
  partnerCapacity: z.coerce.number().int().min(0).max(100_000),
  // Checkbox fields only appear in FormData at all when checked, so an
  // unchecked box means this key is simply absent — handled at the call
  // site below, not with a default here.
  multiLevelReferralsEnabled: z.literal("on").optional(),
  directPartnerSignupEnabled: z.literal("on").optional(),
});

export async function updateReferralProgramSettingsAction(formData: FormData) {
  const session = await requireAdmin();
  const parsed = settingsSchema.safeParse({
    partnerCapacity: formData.get("partnerCapacity"),
    multiLevelReferralsEnabled: formData.get("multiLevelReferralsEnabled") ?? undefined,
    directPartnerSignupEnabled: formData.get("directPartnerSignupEnabled") ?? undefined,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid settings.");

  await updateReferralProgramSettings(
    {
      partnerCapacity: parsed.data.partnerCapacity,
      multiLevelReferralsEnabled: parsed.data.multiLevelReferralsEnabled === "on",
      directPartnerSignupEnabled: parsed.data.directPartnerSignupEnabled === "on",
    },
    session.user.email ?? session.user.id
  );
  revalidatePath("/admin/partners");
  revalidatePath("/partner/signup");
  revalidatePath("/partner");
}
