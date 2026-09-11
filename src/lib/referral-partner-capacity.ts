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
// (see src/lib/referral-partner-waitlist.ts). Accepts an optional
// transaction client so a capacity check can be read inside the same
// locked transaction as the write that depends on it (see
// src/lib/referral-partner-lock.ts) — pass `tx`, not the default `prisma`,
// anywhere the check and the resulting create/update must be atomic.
export async function getReferralPartnerCount(db: Db = prisma): Promise<number> {
  try {
    return await db.referralPartner.count({ where: { suspended: false } });
  } catch {
    return 0;
  }
}
