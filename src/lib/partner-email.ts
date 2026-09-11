import { getSiteUrl, getReferralWhatsAppChannelUrl } from "@/lib/env";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

// Same branded shell as buildReceiptHtml (src/lib/receipt.ts) — kept as a
// separate file since these are partner-facing, not client-facing, emails
// with different content, not a variant of a receipt.
//
// The logo is referenced by absolute URL rather than inlined as base64 —
// standard practice for transactional email, keeps the message small.
// Most email clients block it until "show images" is clicked, which is
// why the header text next to it never depends on the image loading.
function shell(title: string, bodyHtml: string) {
  const logoUrl = `${getSiteUrl()}/icon-512.png`;
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; border: 1px solid #e4b34355; padding: 32px; color: #12151d;">
      <div style="display: flex; align-items: center; gap: 10px; margin: 0 0 20px;">
        <img src="${logoUrl}" alt="NOBS AGENT" width="32" height="32" style="display: block; border-radius: 6px;" />
        <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a5822f; margin: 0;">NOBS AGENT</p>
      </div>
      <h1 style="font-size: 22px; margin: 0 0 24px;">${title}</h1>
      ${bodyHtml}
      <p style="font-family: Arial, sans-serif; font-size: 11px; color: #999; margin-top: 32px;">
        NOBS AGENT · Kaduna, Nigeria, remote-first · nobsagent0@gmail.com
      </p>
    </div>
  `;
}

export function buildClientWelcomeHtml({ clientName }: { clientName: string }) {
  return shell(
    "Welcome to NOBS Agent",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${clientName}, your account is live — glad to have you.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        From your dashboard you can book a consultation, track any project we build together,
        and message us directly whenever you need to. If you haven't already, booking a short
        consultation is the fastest way to get started.
      </p>
    `
  );
}

export function buildPartnerWelcomeHtml({
  partnerName,
  referralCode,
  referralLink,
  fromWaitlist = false,
}: {
  partnerName: string;
  referralCode: string;
  referralLink: string;
  // True when this account was just created off the waitlist (a seat
  // opened up), rather than at normal signup — same email, different
  // opening line so it doesn't read like they signed up twice.
  fromWaitlist?: boolean;
}) {
  return shell(
    "Welcome to NOBS Agent",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        ${
          fromWaitlist
            ? `Hi ${partnerName}, a spot just opened up — you're off the waitlist and your referral partner account is live.`
            : `Hi ${partnerName}, your referral partner account is live.`
        }
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Your referral code is <strong>${referralCode}</strong>. Share your link below —
        anyone who signs up through it and pays gets tracked automatically, and your
        commission is credited the moment they pay.
      </p>
      <div style="margin: 20px 0; padding: 14px; background: #f7f2e7; border: 1px solid #e4b34355; font-family: monospace; font-size: 13px; word-break: break-all;">
        ${referralLink}
      </div>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Add your payout account on your dashboard so your commission pays out
        automatically instead of waiting on a manual transfer.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Join our <a href="${getReferralWhatsAppChannelUrl()}" style="color: #a5822f;">WhatsApp Channel</a> —
        it's where we walk partners through how to actually run this side of the business,
        share what's working, and post updates.
      </p>
    `
  );
}

export function buildPartnerInactivityWarningHtml({ name }: { name: string }) {
  return shell(
    "Your seat — 1 month left",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${name}, you haven't had a paying referral in the last two calendar months.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Referral partner spots are capped, and under the Referral Partner Agreement, going three
        consecutive months with no paying referral means your seat is given up to the next person
        on the waitlist. One more month like this and that happens automatically — a single paying
        referral in the next 30 days resets the count and keeps your seat.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Share your referral link again if it's been a while — check your dashboard for it any time.
      </p>
    `
  );
}

export function buildPartnerSuspendedForInactivityHtml({ name }: { name: string }) {
  return shell(
    "Your referral partner seat has been paused",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${name}, your referral partner account has been suspended after three consecutive
        calendar months with no paying referral, per the Referral Partner Agreement. Your seat has
        been offered to the next person on the waitlist.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Any commission you already earned is unaffected. Reach out to nobsagent0@gmail.com if
        you'd like to discuss reinstatement should a spot open up again.
      </p>
    `
  );
}

export function buildWaitlistJoinedHtml({
  name,
  position,
  statusUrl,
}: {
  name: string;
  position: number;
  statusUrl: string;
}) {
  return shell(
    "You're on the waitlist",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${name}, all referral partner spots are taken right now, so we've added you to the
        waitlist instead — nothing further to do.
      </p>
      <div style="margin: 20px 0; padding: 14px; background: #f7f2e7; border: 1px solid #e4b34355; font-family: Arial, sans-serif; font-size: 14px; text-align: center;">
        You're number <strong>${position}</strong> in line.
      </div>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        The moment a spot opens up, it goes to whoever's been waiting longest — we'll email you
        automatically and your account will be ready to go, no need to sign up again.
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        You can check your position any time here:
      </p>
      <div style="margin: 20px 0; padding: 14px; background: #f7f2e7; border: 1px solid #e4b34355; font-family: monospace; font-size: 13px; word-break: break-all;">
        ${statusUrl}
      </div>
    `
  );
}

export function buildCommissionEarnedHtml({
  partnerName,
  clientName,
  amount,
  ratePercent,
  autoPaidOut,
}: {
  partnerName: string;
  clientName: string;
  amount: number;
  ratePercent: number;
  autoPaidOut: boolean;
}) {
  const isBonusTier = ratePercent >= 20;

  let payoutNote: string;
  if (isBonusTier && autoPaidOut) {
    payoutNote =
      "The base 10% of this has already been sent straight to your bank account. The extra 10% bonus-tier portion is paid out to you directly — check your dashboard for the payout status.";
  } else if (isBonusTier) {
    payoutNote = "This will be paid out to you directly — check your dashboard for the payout status.";
  } else if (autoPaidOut) {
    payoutNote = "This has already been sent straight to your bank account.";
  } else {
    payoutNote = "This will be paid out to you directly — check your dashboard for the payout status.";
  }

  return shell(
    "🎉 Congratulations — you earned a commission",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${partnerName}, ${clientName} just made a payment through your referral link. Nice work.
      </p>
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse; margin: 20px 0; background: #f7f2e7; border: 1px solid #e4b34355;">
        <tr><td style="padding: 10px 14px; color: #666;">Client</td><td style="padding: 10px 14px; text-align: right;">${clientName}</td></tr>
        <tr><td style="padding: 10px 14px; color: #666;">Your rate</td><td style="padding: 10px 14px; text-align: right;">${ratePercent}%</td></tr>
        <tr><td style="padding: 10px 14px; color: #666; font-weight: bold; border-top: 1px solid #e4b34355;">Commission earned</td><td style="padding: 10px 14px; text-align: right; font-weight: bold; border-top: 1px solid #e4b34355; color: #a5822f; font-size: 16px;">${formatNaira(amount)}</td></tr>
      </table>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        ${payoutNote}
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Keep up the good work — every client you bring in grows your standing toward the next
        bonus tier.
      </p>
    `
  );
}

export function buildOverrideCommissionEarnedHtml({
  partnerName,
  recruitName,
  clientName,
  amount,
}: {
  partnerName: string;
  recruitName: string;
  clientName: string;
  amount: number;
}) {
  return shell(
    "🎉 Congratulations — you earned an override commission",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${partnerName}, ${recruitName} — the referral partner you recruited — just earned a
        commission from ${clientName}, and you earned a share of it too.
      </p>
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse; margin: 20px 0; background: #f7f2e7; border: 1px solid #e4b34355;">
        <tr><td style="padding: 10px 14px; color: #666;">Recruited partner</td><td style="padding: 10px 14px; text-align: right;">${recruitName}</td></tr>
        <tr><td style="padding: 10px 14px; color: #666;">Client</td><td style="padding: 10px 14px; text-align: right;">${clientName}</td></tr>
        <tr><td style="padding: 10px 14px; color: #666; font-weight: bold; border-top: 1px solid #e4b34355;">Override earned</td><td style="padding: 10px 14px; text-align: right; font-weight: bold; border-top: 1px solid #e4b34355; color: #a5822f; font-size: 16px;">${formatNaira(amount)}</td></tr>
      </table>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Check your dashboard for the payout status. Keep up the good work — the partners you
        bring in keep earning you a share every time they do.
      </p>
    `
  );
}
