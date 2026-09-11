import type { PrismaClient, Prisma } from "@prisma/client";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";

type Db = PrismaClient | Prisma.TransactionClient;

// Shared by both the normal signup path (src/app/partner/signup/actions.ts)
// and waitlist promotion (src/lib/referral-partner-waitlist.ts) — a
// waitlisted person's recruiter is only resolved for real at promotion
// time (not when they joined the waitlist), since the recruiter's standing
// or the multi-level toggle itself may have changed in the meantime,
// sometimes months later.
//
// Only resolves to a recruiter id when the program is switched on AND the
// code belongs to a real, non-suspended partner AND that partner isn't the
// same email as the person signing up (no self-recruiting) — anything else
// is a silent no-op, the account is still created as a normal, unrecruited
// partner rather than failing outright.
export async function resolveRecruiterId(
  db: Db,
  refCode: string | null,
  newUserEmail: string
): Promise<string | null> {
  if (!refCode) return null;
  const settings = await getReferralProgramSettings();
  if (!settings.multiLevelReferralsEnabled) return null;

  const recruiter = await db.referralPartner.findUnique({
    where: { referralCode: refCode },
    include: { user: true },
  });
  if (!recruiter || recruiter.suspended) return null;
  if (recruiter.user.email.toLowerCase() === newUserEmail.toLowerCase()) return null;

  return recruiter.id;
}
