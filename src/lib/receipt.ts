function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function buildReceiptHtml({
  clientName,
  serviceInterest,
  reference,
  paidThisTransaction,
  totalPaid,
  agreedAmount,
  paidAt,
}: {
  clientName: string;
  serviceInterest: string;
  reference: string;
  paidThisTransaction: number;
  totalPaid: number;
  agreedAmount: number;
  paidAt: Date;
}) {
  const remaining = Math.max(0, agreedAmount - totalPaid);
  const percentPaid = agreedAmount > 0 ? Math.round((totalPaid / agreedAmount) * 100) : 0;
  const fullyPaid = remaining === 0;

  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; border: 1px solid #e4b34355; padding: 32px; color: #12151d;">
      <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a5822f; margin: 0 0 4px;">NOBS AGENT</p>
      <h1 style="font-size: 22px; margin: 0 0 24px;">Payment Receipt</h1>

      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666;">Billed to</td><td style="padding: 6px 0; text-align: right;">${clientName}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Project / service</td><td style="padding: 6px 0; text-align: right;">${serviceInterest}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Reference</td><td style="padding: 6px 0; text-align: right; font-family: monospace;">${reference}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date</td><td style="padding: 6px 0; text-align: right;">${paidAt.toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
      </table>

      <div style="margin: 24px 0; padding: 16px 0; border-top: 1px solid #e4b34355; border-bottom: 1px solid #e4b34355;">
        <table style="width: 100%; font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 0;">This payment</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${formatNaira(paidThisTransaction)}</td></tr>
        </table>
      </div>

      <table style="width: 100%; font-family: Arial, sans-serif; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #666;">Total project cost</td><td style="padding: 4px 0; text-align: right;">${formatNaira(agreedAmount)}</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Total paid to date</td><td style="padding: 4px 0; text-align: right;">${formatNaira(totalPaid)} (${percentPaid}%)</td></tr>
        <tr><td style="padding: 4px 0; color: #666;">Remaining balance</td><td style="padding: 4px 0; text-align: right; ${fullyPaid ? "color: #0f6e56; font-weight: bold;" : ""}">${fullyPaid ? "Paid in full" : formatNaira(remaining)}</td></tr>
      </table>

      <p style="font-family: Arial, sans-serif; font-size: 11px; color: #999; margin-top: 32px;">
        NOBS AGENT · Kaduna, Nigeria, remote-first · nobsagent0@gmail.com
      </p>
    </div>
  `;
}
