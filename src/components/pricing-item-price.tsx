"use client";

import { useCurrency } from "@/lib/currency-context";
import { PriceDisplay } from "@/components/price-display";

export function PricingItemPrice({
  standardPrice,
  launchPrice,
  internationalFloor,
  unit,
}: {
  standardPrice: number;
  launchPrice: number;
  internationalFloor?: number;
  unit?: string;
}) {
  const { isNigerian } = useCurrency();
  const showInternational = !isNigerian && internationalFloor !== undefined;

  // The crossed-out "standard" price is a Nigeria-launch-pricing narrative
  // (this studio's real long-term NGN rate vs. its current discounted
  // rate) — it doesn't apply to the international floor, which is its own
  // researched number, not a discount off anything. Showing both would
  // read backwards (the "was" price is often lower than the international
  // floor), so it's dropped entirely for international pricing.
  return (
    <>
      {!showInternational && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-mono)] text-sm text-red-500 line-through decoration-2">
            <PriceDisplay ngnAmount={standardPrice} />
          </span>
        </div>
      )}
      <div className={`flex items-baseline gap-1 ${showInternational ? "mt-4" : ""}`}>
        <span className="font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)]">
          <PriceDisplay ngnAmount={launchPrice} internationalFloor={internationalFloor} />
        </span>
        {showInternational ? (
          <span className="text-xs text-[var(--color-slate)]">starting from</span>
        ) : (
          unit && <span className="text-xs text-[var(--color-slate)]">{unit}</span>
        )}
      </div>
    </>
  );
}
