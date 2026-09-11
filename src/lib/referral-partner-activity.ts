import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildPartnerInactivityWarningHtml } from "@/lib/partner-email";
import { suspendPartnerAndPromoteNext } from "@/lib/referral-partner-suspension";

// Agreement clause 7.5: 3 consecutive calendar months with zero paying
// (converted) referrals drops the partner; any month with at least one
// resets the streak to zero.
const CONSECUTIVE_MONTHS_BEFORE_DROP = 3;

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export type ActivityCheckResult = {
  monthChecked: string;
  checked: number;
  warned: number;
  suspended: number;
  errors: string[];
};

// Called by the monthly cron (src/app/api/cron/check-partner-activity).
// Always evaluates the calendar month that just fully ended relative to
// `now` — never the current, still-in-progress month — so "3 consecutive
// months" only ever counts months that have actually finished. Safe to
// call more than once for the same month: each partner records the last
// month key it was evaluated for (lastActivityCheckedMonth) and is skipped
// on a repeat run.
export async function checkPartnerActivityForPreviousMonth(now: Date = new Date()): Promise<ActivityCheckResult> {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const key = monthKey(monthStart);

  // Only partners whose seat existed for the WHOLE evaluated month — a
  // partner who joined mid-month shouldn't have that partial month held
  // against them.
  const partners = await prisma.referralPartner.findMany({
    where: {
      suspended: false,
      createdAt: { lt: monthStart },
      lastActivityCheckedMonth: { not: key },
    },
    include: { user: true },
  });

  let warned = 0;
  let suspended = 0;
  const errors: string[] = [];

  for (const partner of partners) {
    try {
      const convertedCount = await prisma.referral.count({
        where: { partnerId: partner.id, convertedAt: { gte: monthStart, lt: monthEnd } },
      });

      if (convertedCount > 0) {
        await prisma.referralPartner.update({
          where: { id: partner.id },
          data: { consecutiveInactiveMonths: 0, lastActivityCheckedMonth: key },
        });
        continue;
      }

      const newStreak = partner.consecutiveInactiveMonths + 1;
      await prisma.referralPartner.update({
        where: { id: partner.id },
        data: { consecutiveInactiveMonths: newStreak, lastActivityCheckedMonth: key },
      });

      if (newStreak >= CONSECUTIVE_MONTHS_BEFORE_DROP) {
        await suspendPartnerAndPromoteNext({
          partnerId: partner.id,
          partnerName: partner.user.name,
          partnerEmail: partner.user.email,
          reason: "inactivity",
        });
        suspended++;
      } else if (newStreak === CONSECUTIVE_MONTHS_BEFORE_DROP - 1 && process.env.BREVO_API_KEY) {
        await sendBrevoEmail({
          to: [{ email: partner.user.email, name: partner.user.name }],
          subject: "Your NOBS Agent referral partner seat — 1 more month",
          htmlContent: buildPartnerInactivityWarningHtml({ name: partner.user.name }),
        }).catch((err) => errors.push(`warning email ${partner.id}: ${err}`));
        warned++;
      }
    } catch (err) {
      errors.push(`partner ${partner.id}: ${err}`);
    }
  }

  return { monthChecked: key, checked: partners.length, warned, suspended, errors };
}
