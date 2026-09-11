import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildPartnerSuspendedForInactivityHtml } from "@/lib/partner-email";
import { promoteNextWaitlistEntry } from "@/lib/referral-partner-waitlist";
import { sendPartnerWelcomeEmail } from "@/lib/send-partner-welcome-email";

// Shared by the admin's manual Suspend button (src/app/admin/partners/actions.ts)
// and the monthly inactivity cron (src/lib/referral-partner-activity.ts) —
// suspending a partner always means the same two things: flip the flag,
// then immediately offer the seat that just freed up to whoever's been
// waiting longest. Only the inactivity path emails the suspended partner
// (a manual admin suspend is assumed to be a deliberate, already-communicated
// decision — this never silently drops someone for the automated reason
// without telling them why).
export async function suspendPartnerAndPromoteNext(params: {
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  reason: "manual" | "inactivity";
}): Promise<void> {
  await prisma.referralPartner.update({ where: { id: params.partnerId }, data: { suspended: true } });

  if (params.reason === "inactivity" && process.env.BREVO_API_KEY) {
    await sendBrevoEmail({
      to: [{ email: params.partnerEmail, name: params.partnerName }],
      subject: "Your NOBS Agent referral partner seat has been paused",
      htmlContent: buildPartnerSuspendedForInactivityHtml({ name: params.partnerName }),
    }).catch((err) => console.error("[suspendPartnerAndPromoteNext] inactivity email failed", err));
  }

  const promoted = await promoteNextWaitlistEntry();
  if (promoted) {
    await sendPartnerWelcomeEmail({
      name: promoted.name,
      email: promoted.email,
      phone: promoted.phone,
      referralCode: promoted.referralCode,
      createdAt: promoted.createdAt,
      fromWaitlist: true,
    }).catch((err) => console.error("[suspendPartnerAndPromoteNext] promoted-partner welcome email failed", err));
  }
}
