export const CONSENT_COOKIE = "nobs_cookie_consent";

export type ConsentStatus = "granted" | "denied" | null;

export function readConsent(): ConsentStatus {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "granted" || value === "denied" ? value : null;
}

export function writeConsent(status: "granted" | "denied") {
  document.cookie = `${CONSENT_COOKIE}=${status}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
