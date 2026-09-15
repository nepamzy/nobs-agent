"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { CURRENCIES, type CurrencyCode } from "./currencies-data";

// Re-exported for backward compatibility \u2014 every existing caller imports
// these from this module (e.g. currency-switcher.tsx). The values
// themselves now live in currencies-data.ts, a plain (non "use client")
// module, so server code can import them too \u2014 see booking-currencies.ts.
export { CURRENCIES, type CurrencyCode };

const STORAGE_KEY = "nobs_currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertFromNgn: (ngnAmount: number) => number;
  // Pricing display only — never the actual amount charged. Real bookings
  // are always billed on the admin-agreed amount (Paystack today, still
  // NGN-only), whatever currency this ends up showing. `internationalFloor`
  // is a USD amount, not NGN — see src/lib/data/pricing-international.ts.
  // A Nigerian visitor (or once they pick NGN themselves) always sees the
  // real NGN price converted for readability; everyone else sees the
  // researched international floor instead.
  format: (ngnAmount: number, internationalFloor?: number) => string;
  // True once geo-IP has resolved and says Nigeria — fetched client-side
  // from /api/geo (an edge route reading Vercel's `x-vercel-ip-country`
  // header), the same pattern already used for /api/exchange-rates. Kept
  // out of the root layout deliberately: reading a per-request header in a
  // Server Component forces that whole render tree dynamic, which would
  // have knocked every statically-generated page on the site off the CDN
  // cache just to support this one pricing decision.
  // Undetermined (still loading, local dev, a header a proxy stripped)
  // defaults to false: shows international pricing rather than risk
  // quietly discounting a Nigerian pretending to be one — err on the
  // higher price and let a real Nigerian visitor confirm via the currency
  // switcher.
  isNigerian: boolean;
  loading: boolean;
  updatedAt: string | null;
  // Raw USD-based rate table, exposed so a caller that needs to convert
  // into a FIXED currency (not the mutable global `currency` state above)
  // can do so directly — e.g. the booking form previewing amounts in
  // whichever currency the client is choosing to pay in right now, which
  // is unrelated to whatever the site-wide currency switcher happens to be
  // set to. Null until the rates fetch resolves.
  rates: Record<string, number> | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Default display currency is USD for every visitor, Nigerian or not —
  // isNigerian only decides which price TABLE applies (NGN-actual vs the
  // international floor), never which currency the number is shown in.
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [isNigerian, setIsNigerian] = useState(false);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrencyState(stored as CurrencyCode);
    }

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.country === "NG") setIsNigerian(true);
      })
      .catch(() => {
        // isNigerian stays false — the safe default, see the comment above
      });

    fetch("/api/exchange-rates")
      .then((res) => res.json())
      .then((data) => {
        setRates(data.rates);
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => {
        // convertFromNgn falls back to NGN-only display when rates never load
      })
      .finally(() => setLoading(false));
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  // Rates are USD-based (from the API), so converting from NGN goes
  // through USD as an intermediate step: NGN -> USD -> target currency.
  const convertFromNgn = useCallback(
    (ngnAmount: number): number => {
      if (!rates || !rates.NGN) return ngnAmount;
      const usdAmount = ngnAmount / rates.NGN;
      const targetRate = rates[currency] ?? 1;
      return usdAmount * targetRate;
    },
    [rates, currency]
  );

  // Same idea, but the source amount is already USD (the international
  // floor prices are researched directly in USD, not derived from NGN).
  const convertFromUsd = useCallback(
    (usdAmount: number): number => {
      if (!rates) return usdAmount;
      const targetRate = rates[currency] ?? 1;
      return usdAmount * targetRate;
    },
    [rates, currency]
  );

  const format = useCallback(
    (ngnAmount: number, internationalFloor?: number): string => {
      // A Nigerian visitor always gets the real NGN price. Everyone else
      // gets the researched international floor when the caller supplies
      // one; callers that don't (invoices, booking amounts, anything tied
      // to a real agreed contract) always convert the real NGN figure —
      // this only ever substitutes a *marketing/list* price.
      const useInternational = !isNigerian && internationalFloor !== undefined;
      const converted = useInternational
        ? convertFromUsd(internationalFloor)
        : convertFromNgn(ngnAmount);
      const meta = CURRENCIES.find((c) => c.code === currency);
      const decimals = currency === "JPY" ? 0 : 2;
      const rounded = converted.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${meta?.symbol ?? currency} ${rounded}`;
    },
    [convertFromNgn, convertFromUsd, currency, isNigerian]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, convertFromNgn, format, isNigerian, loading, updatedAt, rates }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
