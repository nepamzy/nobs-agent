"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "\u20a6" },
  { code: "EUR", name: "Euro", symbol: "\u20ac" },
  { code: "GBP", name: "British Pound", symbol: "\u00a3" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "AU$" },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00a5" },
  { code: "CNY", name: "Chinese Yuan", symbol: "\u00a5" },
  { code: "INR", name: "Indian Rupee", symbol: "\u20b9" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH\u20b5" },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
  { code: "AED", name: "UAE Dirham", symbol: "AED" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "EGP", name: "Egyptian Pound", symbol: "E\u00a3" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const STORAGE_KEY = "nobs_currency";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  convertFromNgn: (ngnAmount: number) => number;
  format: (ngnAmount: number) => string;
  loading: boolean;
  updatedAt: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CURRENCIES.some((c) => c.code === stored)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrencyState(stored as CurrencyCode);
    }

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

  const format = useCallback(
    (ngnAmount: number): string => {
      const converted = convertFromNgn(ngnAmount);
      const meta = CURRENCIES.find((c) => c.code === currency);
      const decimals = currency === "JPY" ? 0 : 2;
      const rounded = converted.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${meta?.symbol ?? currency} ${rounded}`;
    },
    [convertFromNgn, currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertFromNgn, format, loading, updatedAt }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
