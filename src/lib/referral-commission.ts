import type { Prisma } from "@prisma/client";
import { commissionRateForPosition, BASE_RATE_PERCENT, BONUS_RATE_PERCENT } from "@/lib/referral-tier";

type TxClient = Prisma.TransactionClient;

export type CommissionEmailData = {
  partnerEmail: string;
  partnerName: string;
  clientName: string;
  amount: number;
  ratePercent: number;
  autoPaidOut: boolean;
};

// Call this from inside an interactive `prisma.$transaction(async (tx) => {...})`,
// right after creating the BookingPayment row, so its real id is available
// to attach the commission to. Safe no-op if the payer isn't a referred
// user, or their referral has already been disqualified by an admin.
//
// Returns data for a commission-earned email, but deliberately doesn't
// send it itself — an external HTTP call has no place inside a DB
// transaction (same reason the client's own receipt email is sent after
// the transaction closes at every call site, not inside it).
export async function recordReferralCommissionIfApplicable(
  tx: TxClient,
  params: { bookingUserId: string | null; bookingPaymentId: string; paidAmountKobo: number }
): Promise<CommissionEmailData | null> {
  const { bookingUserId, bookingPaymentId, paidAmountKobo } = params;
  if (!bookingUserId) return null;

  const referral = await tx.referral.findUnique({
    where: { referredUserId: bookingUserId },
    include: { partner: { include: { user: true } }, referredUser: true },
  });
  if (!referral || referral.status === "DISQUALIFIED") return null;

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

  if (!commissionRatePercent) return null;

  // Base 10% auto-splits via Paystack's fixed subaccount configuration
  // (see src/lib/paystack.ts) the instant this same payment clears, IF the
  // partner has one set up — so that portion is already paid the moment
  // this row is created. Without a subaccount, it falls back to the same
  // manual-payout tracking every commission used before automation existed.
  const hasAutoPayout = Boolean(referral.partner.paystackSubaccountCode);
  const baseAmount = Math.round((paidAmountKobo * BASE_RATE_PERCENT) / 100);

  await tx.referralCommission.create({
    data: {
      referralId: referral.id,
      bookingPaymentId,
      amount: baseAmount,
      isBonusPortion: false,
      paidOut: hasAutoPayout,
      paidOutAt: hasAutoPayout ? new Date() : null,
    },
  });

  // The bonus tier's extra 10% never auto-splits — it's a deliberate
  // choice (confirmed with the user) to keep Paystack's subaccount split
  // fixed and simple, and pay the bonus portion out manually instead.
  if (commissionRatePercent === BONUS_RATE_PERCENT) {
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

  const totalAmount = baseAmount + (commissionRatePercent === BONUS_RATE_PERCENT ? Math.round((paidAmountKobo * (BONUS_RATE_PERCENT - BASE_RATE_PERCENT)) / 100) : 0);

  await tx.notification.create({
    data: {
      userId: referral.partner.userId,
      title: "You earned a referral commission",
      body: `You earned ₦${(totalAmount / 100).toLocaleString("en-NG")} in commission${hasAutoPayout ? " — the base portion was sent straight to your account" : ""}.`,
      link: "/partner",
    },
  });

  // The in-app notification above always fires; the email respects the
  // same emailNotifications opt-out already honored for client-facing
  // emails elsewhere (src/app/dashboard/messages/direct-actions.ts).
  if (!referral.partner.user.emailNotifications) return null;

  return {
    partnerEmail: referral.partner.user.email,
    partnerName: referral.partner.user.name,
    clientName: referral.referredUser.name,
    amount: totalAmount,
    ratePercent: commissionRatePercent,
    autoPaidOut: hasAutoPayout,
  };
}
