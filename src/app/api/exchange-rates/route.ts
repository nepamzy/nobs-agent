import { NextResponse } from "next/server";

// open.er-api.com is free, requires no API key, and refreshes once every
// 24 hours on their end, matching the "current as of today" requirement
// without needing a paid provider. Base is USD, since NGN prices are
// converted to USD first internally, then to whatever the visitor picks.
const SOURCE_URL = "https://open.er-api.com/v6/latest/USD";

export async function GET() {
  try {
    const res = await fetch(SOURCE_URL, {
      // Revalidate once a day, matches the source's own update cadence,
      // no point fetching more often than the rates actually change.
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error("Rate provider unavailable");

    const data = await res.json();
    if (!data.rates || !data.rates.NGN) throw new Error("Malformed rate response");

    return NextResponse.json({
      base: "USD",
      rates: data.rates,
      updatedAt: data.time_last_update_utc ?? new Date().toISOString(),
    });
  } catch (err) {
    console.error("[exchange-rates] failed to fetch live rates", err);
    // A reasonable fallback so the currency switcher never fully breaks,
    // clearly a static snapshot, not presented as live.
    return NextResponse.json(
      {
        base: "USD",
        rates: {
          USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1550, CAD: 1.37, AUD: 1.52,
          JPY: 149, CNY: 7.2, INR: 84, ZAR: 18.3, GHS: 15.2, KES: 129,
          AED: 3.67, CHF: 0.88, SEK: 10.5, NOK: 10.8, SGD: 1.35, HKD: 7.82,
          BRL: 5.4, MXN: 17.1, EGP: 48.5,
        },
        updatedAt: null,
        fallback: true,
      },
      { status: 200 }
    );
  }
}
