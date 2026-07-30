// `??` only falls back on null/undefined, it does NOT catch an environment
// variable that exists but was left blank (a very easy thing to do in
// Vercel's dashboard: adding the key but leaving the value field empty).
// That gap is exactly what caused a real production build failure
// (`new URL('')` throwing "Invalid URL"), this helper closes it for good.
export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL;
  return value && value.trim() !== "" ? value : "https://example.com";
}
