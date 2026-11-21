import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// The Payments page is hidden behind the same PIN as the analytics revenue
// figure. A correct PIN sets this short-lived, signed, httpOnly cookie, and
// the server only builds the page (amounts, names, receipts) while a valid
// one is present, so a locked page has nothing to read by inspecting it.

export const PAYMENTS_COOKIE = "nobs_payments_unlock";
export const UNLOCK_MINUTES = 15;

function sign(userId: string, expiresAt: number): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret).update(`payments:${userId}:${expiresAt}`).digest("hex");
}

export function makeUnlockValue(userId: string): { value: string; maxAge: number } {
  const expiresAt = Date.now() + UNLOCK_MINUTES * 60_000;
  return { value: `${expiresAt}.${sign(userId, expiresAt)}`, maxAge: UNLOCK_MINUTES * 60 };
}

export async function isPaymentsUnlocked(userId: string): Promise<boolean> {
  if (!process.env.AUTH_SECRET) return false;
  const raw = (await cookies()).get(PAYMENTS_COOKIE)?.value;
  if (!raw) return false;
  const [expiry, sig] = raw.split(".");
  const expiresAt = Number(expiry);
  if (!sig || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = Buffer.from(sign(userId, expiresAt));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
