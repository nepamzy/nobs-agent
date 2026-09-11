// A subsequent (post-deposit) payment still needs a sane floor so a client
// can't send a 1-kobo "payment", ₦1,000 or whatever's left, whichever is
// smaller. Shared between src/app/pay/[id]/page.tsx (display/UI floor) and
// src/app/api/paystack/initialize/route.ts (the same floor enforced
// server-side, since that route can be hit directly).
export const MIN_INSTALLMENT_KOBO = 100_000;
