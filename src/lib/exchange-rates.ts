// Server-side rate fetcher shared by /api/exchange-rates (the client-side
// currency switcher's data source) and anything running on the server that
// needs a rate directly — e.g. /pay/[id]'s page component and the
// Flutterwave verify route, both of which need a rate BEFORE a browser
// exists to hit the API route, so they call this directly instead of
// fetching their own site over HTTP.

const SOURCE_URL = "https://open.er-api.com/v6/latest/USD";

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550, CAD: 1.37, AUD: 1.52,
  JPY: 149, CNY: 7.2, INR: 84, ZAR: 18.3, GHS: 15.2, KES: 129,
  AED: 3.67, CHF: 0.88, SEK: 10.5, NOK: 10.8, SGD: 1.35, HKD: 7.82,
  BRL: 5.4, MXN: 17.1, EGP: 48.5,
};

export type ExchangeRates = {
  rates: Record<string, number>;
  updatedAt: string | null;
  fallback?: true;
};

export async function getExchangeRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch(SOURCE_URL, {
      // Revalidate once a day, matches the source's own update cadence.
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error("Rate provider unavailable");

    const data = await res.json();
    if (!data.rates || !data.rates.NGN) throw new Error("Malformed rate response");

    return { rates: data.rates, updatedAt: data.time_last_update_utc ?? new Date().toISOString() };
  } catch (err) {
    console.error("[exchange-rates] failed to fetch live rates", err);
    return { rates: FALLBACK_RATES, updatedAt: null, fallback: true };
  }
}

// USD is the pivot for every conversion in this app, rates from the source
// above are all USD-based.
export function convertAmount(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  const usd = amount / fromRate;
  return usd * toRate;
}
