"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { generateReferralAgreementPdf } from "@/lib/referral-agreement-pdf";

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
  const suspended = formData.get("suspended") === "true";
  if (typeof id !== "string") throw new Error("Missing partner id.");

  await prisma.referralPartner.update({ where: { id }, data: { suspended: !suspended } });
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

export async function resendPartnerAgreement(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing partner id.");

  const partner = await prisma.referralPartner.findUnique({ where: { id }, include: { user: true } });
  if (!partner) throw new Error("Partner not found.");

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

  await sendBrevoEmail({
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
