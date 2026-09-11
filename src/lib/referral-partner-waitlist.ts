import type { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral-code";
import { resolveRecruiterId } from "@/lib/referral-recruiter";
import { getReferralPartnerCapacity, getReferralPartnerCount } from "@/lib/referral-partner-capacity";
import { lockReferralPartnerCapacity } from "@/lib/referral-partner-lock";

type Db = PrismaClient | Prisma.TransactionClient;
type WaitlistEntry = { id: string; createdAt: Date };

// Position is always computed live from insertion order among unpromoted
// rows, never stored — so nobody needs renumbering when someone ahead of
// them is promoted or the row is otherwise removed. `id` breaks ties on an
// identical `createdAt` (two signups landing in the same millisecond),
// keeping this deterministic.
async function computeWaitlistPosition(db: Db, entry: WaitlistEntry): Promise<number> {
  return db.referralPartnerWaitlist.count({
    where: {
      promotedAt: null,
      OR: [{ createdAt: { lt: entry.createdAt } }, { createdAt: entry.createdAt, id: { lte: entry.id } }],
    },
  });
}

export async function getReferralPartnerWaitlistCount(): Promise<number> {
  try {
    return await prisma.referralPartnerWaitlist.count({ where: { promotedAt: null } });
  } catch {
    return 0;
  }
}

export type WaitlistEntrySummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  position: number;
};

// For /admin/partners — already in queue order, so position is just the
// row's index rather than a per-row count query.
export async function listWaitlistEntries(): Promise<WaitlistEntrySummary[]> {
  try {
    const entries = await prisma.referralPartnerWaitlist.findMany({
      where: { promotedAt: null },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });
    return entries.map((e, i) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      createdAt: e.createdAt,
      position: i + 1,
    }));
  } catch {
    return [];
  }
}

export type WaitlistStatus =
  | { promoted: true; name: string }
  | { promoted: false; name: string; position: number; totalWaiting: number };

// Public, unauthenticated lookup by waitlist row id (see
// /partner/waitlist/[id]) — deliberately exposes nothing but a name and a
// position number, so there's nothing sensitive to gate behind a login
// that doesn't exist yet for someone who isn't a partner.
export async function getWaitlistStatus(id: string): Promise<WaitlistStatus | null> {
  const entry = await prisma.referralPartnerWaitlist.findUnique({ where: { id } });
  if (!entry) return null;
  if (entry.promotedAt) return { promoted: true, name: entry.name };

  const [position, totalWaiting] = await Promise.all([
    computeWaitlistPosition(prisma, entry),
    getReferralPartnerWaitlistCount(),
  ]);
  return { promoted: false, name: entry.name, position, totalWaiting };
}

export type SignupOutcome =
  | { kind: "partner"; userId: string; partnerId: string; name: string; email: string; phone: string; referralCode: string; createdAt: Date }
  | { kind: "waitlisted"; waitlistId: string; name: string; email: string; position: number }
  | { kind: "already_user" }
  | { kind: "already_waitlisted"; waitlistId: string; name: string; email: string; position: number };

// The one entry point for turning a submitted signup form into either a
// live ReferralPartner or a waitlist row — always inside the advisory
// lock, so the capacity check and the write it decides between are
// atomic. Two people submitting for the last open seat at the same instant
// can never both be told they got it: whichever transaction's lock
// acquisition wins re-reads a capacity count that already reflects the
// other's write once it's their turn.
//
// A resubmission (same email, already waitlisted) is idempotent — it
// returns their existing position rather than erroring or creating a
// duplicate row, so an anxious double-click or a retried request is never
// a "blocked" experience.
export async function attemptPartnerSignupOrWaitlist(input: {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  refCode: string | null;
}): Promise<SignupOutcome> {
  return prisma.$transaction(
    async (tx) => {
      await lockReferralPartnerCapacity(tx);

      const existingUser = await tx.user.findUnique({ where: { email: input.email } });
      if (existingUser) return { kind: "already_user" };

      const existingWaitlistEntry = await tx.referralPartnerWaitlist.findUnique({
        where: { email: input.email },
      });
      if (existingWaitlistEntry && !existingWaitlistEntry.promotedAt) {
        const position = await computeWaitlistPosition(tx, existingWaitlistEntry);
        return {
          kind: "already_waitlisted",
          waitlistId: existingWaitlistEntry.id,
          name: existingWaitlistEntry.name,
          email: existingWaitlistEntry.email,
          position,
        };
      }

      const [count, capacity] = await Promise.all([getReferralPartnerCount(tx), getReferralPartnerCapacity()]);

      if (count < capacity) {
        const referralCode = await generateReferralCode(input.name);
        const recruitedByPartnerId = await resolveRecruiterId(tx, input.refCode, input.email);

        const user = await tx.user.create({
          data: { name: input.name, email: input.email, phone: input.phone, passwordHash: input.passwordHash, role: "REFERRER" },
        });
        const partner = await tx.referralPartner.create({
          data: { userId: user.id, referralCode, recruitedByPartnerId },
        });

        return {
          kind: "partner",
          userId: user.id,
          partnerId: partner.id,
          name: input.name,
          email: input.email,
          phone: input.phone,
          referralCode,
          createdAt: partner.createdAt,
        };
      }

      const entry = await tx.referralPartnerWaitlist.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone,
          passwordHash: input.passwordHash,
          refCode: input.refCode,
        },
      });
      const position = await computeWaitlistPosition(tx, entry);
      return { kind: "waitlisted", waitlistId: entry.id, name: entry.name, email: entry.email, position };
    },
    { timeout: 15000 }
  );
}

export type PromotedPartner = {
  userId: string;
  partnerId: string;
  name: string;
  email: string;
  phone: string;
  referralCode: string;
  createdAt: Date;
};

// Called right after a seat opens up (a partner is suspended). A no-op —
// returns null — if there's no free seat after all, or nobody waiting.
// The caller is responsible for emailing the promoted person; this
// function only touches the database.
export async function promoteNextWaitlistEntry(): Promise<PromotedPartner | null> {
  return prisma.$transaction(
    async (tx) => {
      await lockReferralPartnerCapacity(tx);

      const [count, capacity] = await Promise.all([getReferralPartnerCount(tx), getReferralPartnerCapacity()]);
      if (count >= capacity) return null;

      const next = await tx.referralPartnerWaitlist.findFirst({
        where: { promotedAt: null },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      });
      if (!next) return null;

      const referralCode = await generateReferralCode(next.name);
      const recruitedByPartnerId = await resolveRecruiterId(tx, next.refCode, next.email);

      const user = await tx.user.create({
        data: { name: next.name, email: next.email, phone: next.phone, passwordHash: next.passwordHash, role: "REFERRER" },
      });
      const partner = await tx.referralPartner.create({
        data: { userId: user.id, referralCode, recruitedByPartnerId },
      });
      await tx.referralPartnerWaitlist.update({
        where: { id: next.id },
        data: { promotedAt: new Date(), promotedPartnerId: partner.id },
      });

      return {
        userId: user.id,
        partnerId: partner.id,
        name: next.name,
        email: next.email,
        phone: next.phone,
        referralCode,
        createdAt: partner.createdAt,
      };
    },
    { timeout: 15000 }
  );
}
