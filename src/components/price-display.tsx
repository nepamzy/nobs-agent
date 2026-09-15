"use client";

import { useCurrency } from "@/lib/currency-context";

export function PriceDisplay({
  ngnAmount,
  internationalFloor,
}: {
  ngnAmount: number;
  // USD floor price shown to non-Nigerian visitors instead of the NGN
  // conversion — see src/lib/data/pricing-international.ts. Omit for
  // anything tied to a real agreed amount (invoices, booking totals),
  // where every visitor always sees the real NGN figure converted.
  internationalFloor?: number;
}) {
  const { format } = useCurrency();
  return <>{format(ngnAmount, internationalFloor)}</>;
}
