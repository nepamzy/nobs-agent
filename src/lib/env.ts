// `??` only falls back on null/undefined, it does NOT catch an environment
// variable that exists but was left blank (a very easy thing to do in
// Vercel's dashboard: adding the key but leaving the value field empty).
// That gap is exactly what caused a real production build failure
// (`new URL('')` throwing "Invalid URL"), this helper closes it for good.
export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  return value && value.trim() !== "" ? value : "https://example.com";
}

// The referral partner WhatsApp Channel — where partners get taught how
// to actually run the referral side of the business. Same blank-string
// gotcha as getSiteUrl(), plus a real working default (not a placeholder)
// so this keeps working even if the env var is never set on a deployment.
export function getReferralWhatsAppChannelUrl(): string {
  const value = process.env.NEXT_PUBLIC_REFERRAL_WHATSAPP_CHANNEL_URL;
  return value && value.trim() !== "" ? value : "https://whatsapp.com/channel/0029Vb9KZl86GcG7gztP3w1W";
}
