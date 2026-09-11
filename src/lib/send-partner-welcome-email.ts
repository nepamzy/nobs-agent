import { sendBrevoEmail } from "@/lib/brevo";
import { buildPartnerWelcomeHtml } from "@/lib/partner-email";
import { generateReferralAgreementPdf } from "@/lib/referral-agreement-pdf";
import { getSiteUrl } from "@/lib/env";

// Shared by normal signup (src/app/partner/signup/actions.ts) and waitlist
// promotion (src/app/admin/partners/actions.ts) — same welcome email, same
// pre-signed agreement PDF, either way a partner account gets created.
// Effective Date on the agreement is always the real account-creation
// timestamp passed in as `createdAt`, never "today" — matters because this
// PDF can be regenerated later and must keep showing the same date it did
// on day one.
export async function sendPartnerWelcomeEmail(params: {
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  createdAt: Date;
  fromWaitlist?: boolean;
}): Promise<void> {
  if (!process.env.BREVO_API_KEY) return;

  const pdfBytes = await generateReferralAgreementPdf({
    partnerName: params.name,
    partnerEmail: params.email,
    partnerPhone: params.phone,
    effectiveDate: params.createdAt,
  });
  const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

  await sendBrevoEmail({
    to: [{ email: params.email, name: params.name }],
    subject: "Welcome to NOBS Agent",
    htmlContent: buildPartnerWelcomeHtml({
      partnerName: params.name,
      referralCode: params.referralCode,
      referralLink: `${getSiteUrl()}/signup?ref=${params.referralCode}`,
      fromWaitlist: params.fromWaitlist,
    }),
    attachment: [{ name: "NOBS-Agent-Referral-Partner-Agreement.pdf", content: pdfBase64 }],
  });
}
