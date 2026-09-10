import type { Prisma } from "@prisma/client";
import { commissionRateForPosition, BASE_RATE_PERCENT, BONUS_RATE_PERCENT } from "@/lib/referral-tier";

type TxClient = Prisma.TransactionClient;

// Paystack settles a split to a linked bank account on its own schedule,
// never instantly — never claim the money has "already been sent" before
// this has actually had time to happen. Tune this once the studio's real
// Paystack settlement schedule is confirmed; 2 days is a safe default
// (covers a weekend, doesn't wildly over-promise on a weekday).
export const SETTLEMENT_DELAY_DAYS = 2;

// The recruiter's cut of a direct recruit's BASE-tier commission only —
// never during that recruit's 20% bonus tier (confirmed: bonus tier is
// always a flat 80/20 between NOBS and whoever qualified for it, no
// override). "Direct" is the whole rule: a recruiter only ever earns this
// off people THEY personally recruited, never further up any chain.
export const OVERRIDE_RATE_PERCENT = 5;

export type CommissionEmailData =
  | {
      kind: "base";
      partnerEmail: string;
      partnerName: string;
      clientName: string;
      amount: number;
      ratePercent: number;
      autoPaidOut: boolean;
    }
  | {
      kind: "override";
      partnerEmail: string;
      partnerName: string;
      recruitName: string;
      clientName: string;
      amount: number;
    };

// Call this from inside an interactive `prisma.$transaction(async (tx) => {...})`,
// right after creating the BookingPayment row, so its real id is available
// to attach the commission to. Safe no-op if the payer isn't a referred
// user, or their referral has already been disqualified by an admin.
//
// Returns data for whichever commission emails should be sent RIGHT NOW
// (no subaccount to wait on) — deliberately doesn't send them itself, an
// external HTTP call has no place inside a DB transaction. Up to two:
// the referral's own partner (base + bonus combined, as before) and,
// separately, that partner's recruiter (the 5% override), since they're
// different people. Either, both, or neither can come back — a row with
// a subaccount attached returns nothing here at all, the settlement cron
// (src/app/api/cron/settle-commissions/route.ts) handles it once Paystack
// has actually had time to settle the money.
export async function recordReferralCommissionIfApplicable(
  tx: TxClient,
  params: { bookingUserId: string | null; bookingPaymentId: string; paidAmountKobo: number }
): Promise<CommissionEmailData[]> {
  const { bookingUserId, bookingPaymentId, paidAmountKobo } = params;
  const emails: CommissionEmailData[] = [];
  if (!bookingUserId) return emails;

  const referral = await tx.referral.findUnique({
    where: { referredUserId: bookingUserId },
    include: { partner: { include: { user: true } }, referredUser: true },
  });
  if (!referral || referral.status === "DISQUALIFIED") return emails;

  let commissionRatePercent = referral.commissionRatePercent;

  if (referral.status === "PENDING") {
    // First payment ever from this referral — this is where the rate
    // gets locked in, based on the partner's lifetime paid-referral count
    // at this exact moment. Later referrals crossing into bonus territory
    // never change this one after the fact.
    const positionInSequence = referral.partner.paidReferralCount + 1;
    commissionRatePercent = commissionRateForPosition(positionInSequence);

    await tx.referral.update({
      where: { id: referral.id },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        commissionRatePercent,
        tierPositionAtQualification: positionInSequence,
      },
    });
    await tx.referralPartner.update({
      where: { id: referral.partnerId },
      data: { paidReferralCount: { increment: 1 } },
    });
  }

  if (!commissionRatePercent) return emails;

  // Base 10% auto-splits via Paystack's fixed subaccount configuration
  // (see src/lib/paystack.ts) once Paystack settles this payment, IF the
  // partner has one set up — it does NOT land in their account the instant
  // this row is created, whatever hasAutoPayout is about to say; that's
  // exactly what autoSettlesAt exists to make honest. Without a
  // subaccount, this falls back to the same manual-payout tracking every
  // commission used before automation existed, which never claimed
  // anything had already moved — that path still notifies immediately.
  const hasAutoPayout = Boolean(referral.partner.paystackSubaccountCode);
  const baseAmount = Math.round((paidAmountKobo * BASE_RATE_PERCENT) / 100);
  const settlesAt = new Date(Date.now() + SETTLEMENT_DELAY_DAYS * 24 * 60 * 60 * 1000);

  await tx.referralCommission.create({
    data: {
      referralId: referral.id,
      bookingPaymentId,
      amount: baseAmount,
      isBonusPortion: false,
      paidOut: false,
      autoSettlesAt: hasAutoPayout ? settlesAt : null,
    },
  });

  // The bonus tier's extra 10% never auto-splits — it's a deliberate
  // choice (confirmed with the user) to keep Paystack's subaccount split
  // fixed and simple, and pay the bonus portion out manually instead. It
  // never sets autoSettlesAt, there's nothing to wait on.
  const isBonusTier = commissionRatePercent === BONUS_RATE_PERCENT;
  if (isBonusTier) {
    const bonusAmount = Math.round((paidAmountKobo * (BONUS_RATE_PERCENT - BASE_RATE_PERCENT)) / 100);
    await tx.referralCommission.create({
      data: {
        referralId: referral.id,
        bookingPaymentId,
        amount: bonusAmount,
        isBonusPortion: true,
        paidOut: false,
      },
    });
  }

  // With a subaccount attached, notifying now would be the exact
  // "already sent" claim this function exists to avoid — the settlement
  // cron sends the combined (base + bonus, if any) notification/email
  // once autoSettlesAt actually passes.
  if (!hasAutoPayout) {
    const totalAmount =
      baseAmount + (isBonusTier ? Math.round((paidAmountKobo * (BONUS_RATE_PERCENT - BASE_RATE_PERCENT)) / 100) : 0);

    await tx.notification.create({
      data: {
        userId: referral.partner.userId,
        title: "You earned a referral commission",
        body: `You earned ₦${(totalAmount / 100).toLocaleString("en-NG")} in commission.`,
        link: "/partner",
      },
    });

    // The in-app notification above always fires; the email respects the
    // same emailNotifications opt-out already honored for client-facing
    // emails elsewhere (src/app/dashboard/messages/direct-actions.ts).
    if (referral.partner.user.emailNotifications) {
      emails.push({
        kind: "base",
        partnerEmail: referral.partner.user.email,
        partnerName: referral.partner.user.name,
        clientName: referral.referredUser.name,
        amount: totalAmount,
        ratePercent: commissionRatePercent,
        autoPaidOut: false,
      });
    }
  }

  // ---- Two-tier override: 5% to whoever directly recruited this partner ----
  // Base tier only (never during a bonus-tier payment, confirmed), only
  // when the program is switched on, and only when the recruiter isn't
  // suspended — a suspended partner never earns anything, override
  // included. Rate is fixed regardless of the referral's own tier
  // position; only the recruit's OWN commission tier ever varies.
  if (!isBonusTier && referral.partner.recruitedByPartnerId) {
    const settings = await tx.referralProgramSettings.findUnique({ where: { id: "singleton" } });
    if (settings?.multiLevelReferralsEnabled) {
      const recruiter = await tx.referralPartner.findUnique({
        where: { id: referral.partner.recruitedByPartnerId },
        include: { user: true },
      });

      if (recruiter && !recruiter.suspended) {
        const overrideAmount = Math.round((paidAmountKobo * OVERRIDE_RATE_PERCENT) / 100);
        const recruiterHasAutoPayout = Boolean(recruiter.paystackSubaccountCode);

        await tx.referralCommission.create({
          data: {
            referralId: referral.id,
            bookingPaymentId,
            amount: overrideAmount,
            isOverridePortion: true,
            recipientPartnerId: recruiter.id,
            paidOut: false,
            autoSettlesAt: recruiterHasAutoPayout ? settlesAt : null,
          },
        });

        if (!recruiterHasAutoPayout) {
          await tx.notification.create({
            data: {
              userId: recruiter.userId,
              title: "You earned an override commission",
              body: `You earned ₦${(overrideAmount / 100).toLocaleString("en-NG")} from ${referral.partner.user.name}'s referral.`,
              link: "/partner",
            },
          });

          if (recruiter.user.emailNotifications) {
            emails.push({
              kind: "override",
              partnerEmail: recruiter.user.email,
              partnerName: recruiter.user.name,
              recruitName: referral.partner.user.name,
              clientName: referral.referredUser.name,
              amount: overrideAmount,
            });
          }
        }
      }
    }
  }

  return emails;
}
