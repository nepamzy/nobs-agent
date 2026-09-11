import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildPartnerBookingNudgeHtml } from "@/lib/partner-email";

const NUDGE_INTERVAL_DAYS = 14;

export type BookingNudgeResult = {
  checked: number;
  nudged: number;
  errors: string[];
};

// Called by the daily cron (src/app/api/cron/nudge-unbooked-referrals).
// Anchored to each partner's own signup date, not a shared calendar date —
// "due" means at least 14 days have passed since the last time this
// partner was checked (or since signup, for a partner never checked
// before). Every due partner gets `lastReferralNudgeCheckedAt` advanced to
// now regardless of outcome, which is what keeps the cadence at a fixed
// 14 days even through a cycle where nothing was sent — checking again
// tomorrow would defeat the point of a bi-weekly reminder.
export async function checkAndSendBookingNudges(now: Date = new Date()): Promise<BookingNudgeResult> {
  const cutoff = new Date(now.getTime() - NUDGE_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

  const partners = await prisma.referralPartner.findMany({
    where: {
      suspended: false,
      OR: [{ lastReferralNudgeCheckedAt: null, createdAt: { lte: cutoff } }, { lastReferralNudgeCheckedAt: { lte: cutoff } }],
    },
    include: {
      user: true,
      referrals: {
        where: { status: { not: "DISQUALIFIED" } },
        include: { referredUser: { select: { name: true, bookings: { select: { id: true }, take: 1 } } } },
      },
    },
  });

  let nudged = 0;
  const errors: string[] = [];

  for (const partner of partners) {
    try {
      const unbooked = partner.referrals.filter((r) => r.referredUser.bookings.length === 0);

      if (unbooked.length > 0 && process.env.BREVO_API_KEY && partner.user.emailNotifications) {
        await sendBrevoEmail({
          to: [{ email: partner.user.email, name: partner.user.name }],
          subject: "A quick nudge on your referral",
          htmlContent: buildPartnerBookingNudgeHtml({
            partnerName: partner.user.name,
            unbookedClientNames: unbooked.map((r) => r.referredUser.name),
          }),
        });
        nudged++;
      }

      await prisma.referralPartner.update({
        where: { id: partner.id },
        data: { lastReferralNudgeCheckedAt: now },
      });
    } catch (err) {
      errors.push(`partner ${partner.id}: ${err}`);
    }
  }

  return { checked: partners.length, nudged, errors };
}
