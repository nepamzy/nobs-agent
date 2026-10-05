"use client";

import { useCurrency } from "@/lib/currency-context";
import { usePricingText } from "@/lib/i18n/pricing-text";

// Shown whenever the display currency is Naira — a geo-detected Nigerian
// visitor's default currency stays USD (see currency-context.tsx), so this
// fires the moment anyone, Nigerian or not, switches to NGN and sees the
// real (lower) Nigerian pricing.
export function NigeriaDiscountBanner() {
  const { currency } = useCurrency();
  const tp = usePricingText();
  if (currency !== "NGN") return null;

  return (
    <div className="mx-auto mt-4 max-w-3xl px-6">
      <p className="text-center text-sm font-medium text-[var(--color-brass)]">
        {tp("Discounts for Nigerians are much more.")}
      </p>
    </div>
  );
}
