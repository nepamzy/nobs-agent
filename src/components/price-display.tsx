"use client";

import { useCurrency } from "@/lib/currency-context";

export function PriceDisplay({ ngnAmount }: { ngnAmount: number }) {
  const { format } = useCurrency();
  return <>{format(ngnAmount)}</>;
}
