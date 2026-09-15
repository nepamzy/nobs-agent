"use client";

import { useCurrency } from "@/lib/currency-context";
import { PriceDisplay } from "@/components/price-display";

// AI Automation has never had a fixed Nigerian price — every build is
// scoped to the client, so a Nigerian visitor still just sees "book a
// consultation" (unchanged). Everyone else now gets the researched
// international floor as a starting-from figure.
export function AiTierPrice({ floorUsd }: { floorUsd: number }) {
  const { isNigerian } = useCurrency();
  if (isNigerian) return null;

  return (
    <p className="mt-3 font-[family-name:var(--font-mono)] text-xl text-[var(--color-teal)]">
      {/* ngnAmount is never read here — isNigerian is false and
          internationalFloor is always supplied, so format() always takes
          the international branch. */}
      From <PriceDisplay ngnAmount={0} internationalFloor={floorUsd} />
    </p>
  );
}
