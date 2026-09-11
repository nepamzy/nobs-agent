import type { Prisma } from "@prisma/client";

// Serializes every write that can change how many ReferralPartner seats
// are occupied — a new signup taking the last seat, a suspension freeing
// one, a waitlist promotion filling one, a reactivation taking one back —
// behind a single Postgres advisory lock. Without this, two requests can
// both read "99 of 100 taken" and both proceed to create a partner,
// overshooting capacity; the classic check-then-act race.
//
// Scoped to the transaction (`_xact_`, not the plain `pg_advisory_lock`)
// so it always releases on commit OR rollback, even if the request dies
// mid-transaction — never needs a manual unlock, never leaks.
//
// Must be called as the very first statement inside a `prisma.$transaction`
// callback, before any capacity read in that transaction.
export async function lockReferralPartnerCapacity(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext('referral_partner_capacity'))`);
}
