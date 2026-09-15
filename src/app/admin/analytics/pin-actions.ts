"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getTotalRevenueKobo } from "@/lib/revenue";
import { isValidPinFormat, normalizePin, setRevenuePin, verifyRevenuePin } from "@/lib/revenue-pin";

export type PinActionResult = { ok: true } | { ok: false; error: string };
export type RevealResult = { ok: true; amount: number } | { ok: false; error: string };

// Setting (or changing) the PIN itself is ADMIN-only — the same highest
// bar this app already uses for other revenue-affecting actions (see
// clearAllPaymentData in ../payments/actions.ts).
export async function setRevenuePinAction(formData: FormData): Promise<PinActionResult> {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { ok: false, error: "Not authorized." };
  }

  const pin = formData.get("pin");
  const confirmPin = formData.get("confirmPin");
  if (typeof pin !== "string" || typeof confirmPin !== "string") {
    return { ok: false, error: "Invalid input." };
  }

  const normalized = normalizePin(pin);
  if (!isValidPinFormat(normalized)) {
    return { ok: false, error: "PIN must be exactly 4 characters: 2 letters and 2 digits." };
  }
  if (normalized !== normalizePin(confirmPin)) {
    return { ok: false, error: "PINs don't match." };
  }

  await setRevenuePin(normalized, session.user.id);
  revalidatePath("/admin/analytics");
  return { ok: true };
}

// Revealing with a correct PIN is open to anyone who already has
// /admin/analytics access (ADMIN or STAFF) — the PIN itself, chosen by an
// admin, is what actually gates this, not the role check.
export async function revealRevenueAction(formData: FormData): Promise<RevealResult> {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { ok: false, error: "Not authorized." };
  }

  // A 2-letter-2-digit PIN has a few hundred thousand combinations, small
  // enough to matter — rate-limited per admin account, same pattern as
  // every other guessable-secret check in this app.
  const { success } = rateLimit(`revenue-pin:${session.user.id}`, 5, 5 * 60_000);
  if (!success) {
    return { ok: false, error: "Too many attempts, try again in a few minutes." };
  }

  const pin = formData.get("pin");
  if (typeof pin !== "string") return { ok: false, error: "Invalid input." };

  const valid = await verifyRevenuePin(pin);
  if (!valid) return { ok: false, error: "Incorrect PIN." };

  const amount = await getTotalRevenueKobo();
  return { ok: true, amount };
}
