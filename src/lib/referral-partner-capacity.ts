import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";

type Db = PrismaClient | Prisma.TransactionClient;

// Admin-editable now (see /admin/partners) — this function is the only
// place that should be called for the current cap, never a hardcoded
// number, so raising it from the admin panel takes effect everywhere at
// once with no code change.
export async function getReferralPartnerCapacity(): Promise<number> {
  const { partnerCapacity } = await getReferralProgramSettings();
  return partnerCapacity;
}

// Counts only ACTIVE seats — a suspended partner doesn't occupy a slot,
// which is what makes suspension actually free one up for the waitlist
// (see src/lib/referral-partner-waitlist.ts). Also excludes an account
// that hasn't yet acknowledged the inactivity policy
// (src/app/partner/policy/page.tsx, enforced before any dashboard page
// renders): if someone abandons that screen, the account row exists but
// they were never actually let in, so it shouldn't hold a capacity slot
// the next person on the waitlist could otherwise fill.
//
// This only means what it's supposed to because every partner who
// existed BEFORE that policy screen did (and so never had a real chance
// to see or tick it) was backfilled to a non-null ack in migration
// 20260917192710_backfill_legacy_partner_policy_ack — without that, this
// exclusion wrongly swept up the entire pre-existing partner base too,
// not just genuinely abandoned new signups.
//
// Accepts an optional transaction client so a capacity check can be read
// inside the same locked transaction as the write that depends on it (see
// src/lib/referral-partner-lock.ts) — pass `tx`, not the default `prisma`,
// anywhere the check and the resulting create/update must be atomic.
export async function getReferralPartnerCount(db: Db = prisma): Promise<number> {
  try {
    return await db.referralPartner.count({
      where: { suspended: false, inactivityPolicyAckAt: { not: null } },
    });
  } catch {
    return 0;
  }
}
