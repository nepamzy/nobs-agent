// Brevo (formerly Sendinblue) transactional email, a direct REST call,
// same lightweight pattern the Resend integration used, no extra SDK
// dependency needed. Docs: https://developers.brevo.com/reference/sendtransacemail

type SendEmailArgs = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: string;
};

export async function sendBrevoEmail({ to, subject, htmlContent, replyTo }: SendEmailArgs) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[brevo] BREVO_API_KEY not set, skipping email send.");
    return { skipped: true };
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@nobsagent.com";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "NOBS AGENT", email: senderEmail },
      to,
      subject,
      htmlContent,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Brevo send failed (${res.status}): ${errText}`);
  }

  return res.json();
}
