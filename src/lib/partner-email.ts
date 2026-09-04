function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

// Same branded shell as buildReceiptHtml (src/lib/receipt.ts) — kept as a
// separate file since these are partner-facing, not client-facing, emails
// with different content, not a variant of a receipt.
function shell(title: string, bodyHtml: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; border: 1px solid #e4b34355; padding: 32px; color: #12151d;">
      <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a5822f; margin: 0 0 4px;">NOBS AGENT</p>
      <h1 style="font-size: 22px; margin: 0 0 24px;">${title}</h1>
      ${bodyHtml}
      <p style="font-family: Arial, sans-serif; font-size: 11px; color: #999; margin-top: 32px;">
        NOBS AGENT · Kaduna, Nigeria, remote-first · nobsagent0@gmail.com
      </p>
    </div>
  `;
}

export function buildPartnerWelcomeHtml({
  partnerName,
  referralCode,
  referralLink,
}: {
  partnerName: string;
  referralCode: string;
  referralLink: string;
}) {
  return shell(
    "Welcome to NOBS Agent",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${partnerName}, your referral partner account is live.
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
    "You earned a commission",
    `
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        Hi ${partnerName}, ${clientName} just made a payment through your referral link.
      </p>
      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 6px 0; color: #666;">Client</td><td style="padding: 6px 0; text-align: right;">${clientName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Your rate</td><td style="padding: 6px 0; text-align: right;">${ratePercent}%</td></tr>
        <tr><td style="padding: 6px 0; color: #666; font-weight: bold;">Commission earned</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${formatNaira(amount)}</td></tr>
      </table>
      <p style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
        ${payoutNote}
      </p>
    `
  );
}
