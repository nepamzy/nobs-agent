import { formatMajorAmount, fromMinorUnits } from "@/lib/booking-currencies";

function formatMoney(minorAmount: number, currency: string) {
  return formatMajorAmount(fromMinorUnits(minorAmount, currency), currency);
}

export function buildReceiptHtml({
  clientName,
  serviceInterest,
  reference,
  paidThisTransaction,
  totalPaid,
  agreedAmount,
  paidAt,
  currency = "NGN",
  receiptCode,
  receiptUrl,
  qrUrl,
}: {
  clientName: string;
  serviceInterest: string;
  reference: string;
  paidThisTransaction: number;
  totalPaid: number;
  agreedAmount: number;
  paidAt: Date;
  currency?: string;
  receiptCode?: string;
  receiptUrl?: string;
  qrUrl?: string;
}) {
  const formatAmount = (amount: number) => formatMoney(amount, currency);
  const remaining = Math.max(0, agreedAmount - totalPaid);
  const percentPaid = agreedAmount > 0 ? Math.round((totalPaid / agreedAmount) * 100) : 0;
  const fullyPaid = remaining === 0;

  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; border: 1px solid #e4b34355; padding: 32px; color: #12151d;">
      <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a5822f; margin: 0 0 4px;">NOBS AGENT</p>
      <h1 style="font-size: 22px; margin: 0 0 ${receiptCode ? "4px" : "24px"};">Payment Receipt</h1>
      ${receiptCode ? `<p style="font-family: monospace; font-size: 13px; color: #a5822f; margin: 0 0 24px;">${receiptCode}</p>` : ""}

      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Billed to</td><td style="padding: 6px 0; text-align: right;">${clientName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Project / service</td><td style="padding: 6px 0; text-align: right;">${serviceInterest}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Reference</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${reference}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; text-align: right;">${paidAt.toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
      </table>

      <div style="margin: 24px 0; padding: 16px 0; border-top: 1px solid #e4b34355; border-bottom: 1px solid #e4b34355;">
        <table style="width: 100%; font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0;">This payment</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${formatAmount(paidThisTransaction)}</td></tr>
        </table>
      </div>

      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #666;">Total project cost</td><td style="padding: 4px 0; text-align: right;">${formatAmount(agreedAmount)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Total paid to date</td><td style="padding: 4px 0; text-align: right;">${formatAmount(totalPaid)} (${percentPaid}%)</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Remaining balance</td><td style="padding: 4px 0; text-align: right; ${fullyPaid ? "color: #0f6e56; font-weight: bold;" : ""}">${fullyPaid ? "Paid in full" : formatAmount(remaining)}</td></tr>
      </table>

      ${
        receiptUrl && qrUrl
          ? `<table style="width: 100%; margin-top: 24px; border-collapse: collapse;"><tr>
              <td style="width: 96px; vertical-align: top;"><a href="${receiptUrl}"><img src="${qrUrl}" width="88" height="88" alt="QR code for this receipt" style="border: 1px solid #e4b34355;" /></a></td>
              <td style="vertical-align: middle; font-family: Arial, sans-serif; font-size: 12px; color: #444;">Scan the code, or <a href="${receiptUrl}" style="color: #a5822f;">open this receipt online</a>, any time. A PDF copy is attached.</td>
            </tr></table>`
          : ""
      }

      <p style="font-family: Arial, sans-serif; font-size: 11px; color: #999; margin-top: 32px;">
        NOBS AGENT · Kaduna, Nigeria, remote-first · nobsagent0@gmail.com
      </p>
    </div>
  `;
}
