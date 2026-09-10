import { prisma } from "@/lib/prisma";
import { commissionRateForPosition, BASE_RATE_PERCENT } from "@/lib/referral-tier";
import { OVERRIDE_RATE_PERCENT } from "@/lib/referral-commission";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";

export type PaystackSplitPlan =
  | { kind: "none" }
  | { kind: "single"; subaccountCode: string }
  | { kind: "dual"; mainCode: string; mainShare: number; overrideCode: string; overrideShare: number };

// The single source of truth for "what split does Paystack need for this
// specific upcoming payment" — used at checkout-initialize time so the
// split Paystack actually applies never drifts from what
// recordReferralCommissionIfApplicable (src/lib/referral-commission.ts)
// later records as owed. Mirrors that function's own rate/eligibility
// logic exactly; if one changes, the other must too.
//
// One inherent limitation, not solved here: for a referral's very FIRST
// payment, the rate depends on the partner's paidReferralCount at the
// moment of payment, which can only be predicted (not locked) at
// checkout-initialize time — a rare concurrent-first-payment race could
// see a stale count. The commission ledger itself (recorded at verify
// time, inside a transaction) is always the authoritative source of what's
// actually owed regardless; only the automatic Paystack split percentage
// could be briefly stale in that edge case.
export async function computeCheckoutSplitPlan(bookingUserId: string | null): Promise<PaystackSplitPlan> {
  if (!bookingUserId) return { kind: "none" };

  const referral = await prisma.referral.findUnique({
    where: { referredUserId: bookingUserId },
    include: { partner: true },
  });
  if (!referral || referral.status === "DISQUALIFIED" || referral.partner.suspended) return { kind: "none" };
  if (!referral.partner.paystackSubaccountCode) return { kind: "none" };

  let ratePercent = referral.commissionRatePercent;
  if (referral.status === "PENDING") {
    ratePercent = commissionRateForPosition(referral.partner.paidReferralCount + 1);
  }
  if (!ratePercent) return { kind: "none" };

  if (ratePercent !== BASE_RATE_PERCENT) {
    // Bonus tier: only the fixed base share ever auto-splits, the extra
    // bonus portion always stays manual — same limitation this flow has
    // had since before the two-tier program existed.
    return { kind: "single", subaccountCode: referral.partner.paystackSubaccountCode };
  }

  if (referral.partner.recruitedByPartnerId) {
    const settings = await getReferralProgramSettings();
    if (settings.multiLevelReferralsEnabled) {
      const recruiter = await prisma.referralPartner.findUnique({
        where: { id: referral.partner.recruitedByPartnerId },
      });
      if (recruiter && !recruiter.suspended && recruiter.paystackSubaccountCode) {
        return {
          kind: "dual",
          mainCode: referral.partner.paystackSubaccountCode,
          mainShare: BASE_RATE_PERCENT,
          overrideCode: recruiter.paystackSubaccountCode,
          overrideShare: OVERRIDE_RATE_PERCENT,
        };
      }
    }
  }

  return { kind: "single", subaccountCode: referral.partner.paystackSubaccountCode };
}
