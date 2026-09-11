// Commission tier math for the referral partner program. A partner's
// paid referrals repeat through a 15-referral cycle: the first 10 pay the
// base rate, the next 5 pay the bonus rate, then it resets — this repeats
// indefinitely (11-15 bonus, 16-25 base, 26-30 bonus, ...).
// Exported since src/lib/referral-commission.ts needs to split a bonus-tier
// (20%) payment into its base + bonus portions separately (base auto-pays
// via Paystack, bonus stays manual — see that file for why).
export const BASE_RATE_PERCENT = 10;
export const BONUS_RATE_PERCENT = 20;
const BASE_TIER_SIZE = 10;
const CYCLE_LENGTH = 15;

// `positionInSequence` is 1-indexed: the partner's paidReferralCount + 1
// at the moment this referral makes its first payment. The result is
// locked onto that referral permanently — later referrals moving the
// partner into bonus territory never change an already-qualified one.
export function commissionRateForPosition(positionInSequence: number): number {
  const positionInCycle = ((positionInSequence - 1) % CYCLE_LENGTH) + 1;
  return positionInCycle > BASE_TIER_SIZE ? BONUS_RATE_PERCENT : BASE_RATE_PERCENT;
}

// For the partner dashboard's tier-progress display: given how many paid
// referrals they have now, how many more until the next bonus-tier
// referral, and are they currently in the bonus window?
export function tierProgress(paidReferralCount: number): {
  positionInCycle: number;
  inBonusTier: boolean;
  referralsUntilNextBonus: number;
} {
  const nextPosition = paidReferralCount + 1;
  const positionInCycle = ((nextPosition - 1) % CYCLE_LENGTH) + 1;
  const inBonusTier = positionInCycle > BASE_TIER_SIZE;
  const referralsUntilNextBonus = inBonusTier ? 0 : BASE_TIER_SIZE - positionInCycle + 1;
  return { positionInCycle, inBonusTier, referralsUntilNextBonus };
}
