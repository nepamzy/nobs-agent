// A subsequent (post-deposit) payment still needs a sane floor so a client
// can't send a 1-kobo "payment", ₦1,000 or whatever's left, whichever is
// smaller. Shared between src/app/pay/[id]/page.tsx (display/UI floor) and
// src/app/api/paystack/initialize/route.ts (the same floor enforced
// server-side, since that route can be hit directly).
export const MIN_INSTALLMENT_KOBO = 100_000;

// Same idea as MIN_INSTALLMENT_KOBO above, but for a non-NGN booking's own
// currency (major units, not minor) — a small, sane per-currency floor for
// a subsequent installment, not derived from any FX conversion of the
// Naira figure. Used by src/app/pay/[id]/page.tsx.
export const MIN_INTERNATIONAL_INSTALLMENT_MAJOR: Record<string, number> = {
  USD: 10,
  GBP: 10,
  EUR: 10,
  GHS: 50,
  KES: 500,
  ZAR: 100,
  EGP: 200,
};
