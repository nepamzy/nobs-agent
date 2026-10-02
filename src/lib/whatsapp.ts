// Thin wrapper around the WhatsApp Cloud API's send-message endpoint.
// Requires WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID in env —
// the Phone Number ID is from Meta's WhatsApp API Setup screen, NOT the
// phone number itself.

const GRAPH_VERSION = "v21.0";

export async function sendWhatsAppMessage(to: string, body: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error("[whatsapp] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN");
    return { ok: false as const, error: "WhatsApp not configured" };
  }

  // WhatsApp caps a single text message at 4096 characters — split long
  // replies rather than letting the API reject them outright.
  const chunks = splitMessage(body, 4000);

  for (const chunk of chunks) {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: chunk, preview_url: false },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("[whatsapp] send failed", res.status, errText);
      return { ok: false as const, error: errText };
    }
  }

  return { ok: true as const };
}

function splitMessage(body: string, maxLen: number): string[] {
  if (body.length <= maxLen) return [body];
  const chunks: string[] = [];
  let remaining = body;
  while (remaining.length > maxLen) {
    // Prefer to break on a paragraph/sentence boundary near the limit
    // rather than mid-word.
    let cut = remaining.lastIndexOf("\n\n", maxLen);
    if (cut < maxLen * 0.5) cut = remaining.lastIndexOf(". ", maxLen);
    if (cut < maxLen * 0.5) cut = maxLen;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
