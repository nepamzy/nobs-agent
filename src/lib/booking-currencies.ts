import { CURRENCIES } from "./currencies-data";

// Currencies actually offered on the booking form and charged for real
// through Flutterwave at /pay/[id] — a deliberately narrower list than the
// full CURRENCIES set in currency-context.tsx (which is /pricing DISPLAY
// only). Limited to currencies Flutterwave's standard checkout documents
// as supported (https://developer.flutterwave.com/docs/making-payments),
// so a client can't pick a currency the studio has no way to actually
// receive. NGN bookings never touch Flutterwave for this reason, either —
// they keep using Paystack, unchanged.
export const BOOKING_CURRENCY_CODES = [
  "NGN",
  "USD",
  "GBP",
  "EUR",
  "GHS",
  "KES",
  "ZAR",
  "EGP",
] as const;

export type BookingCurrencyCode = (typeof BOOKING_CURRENCY_CODES)[number];

export const BOOKING_CURRENCIES = CURRENCIES.filter((c) =>
  (BOOKING_CURRENCY_CODES as readonly string[]).includes(c.code)
);

export function isBookingCurrency(code: string): code is BookingCurrencyCode {
  return (BOOKING_CURRENCY_CODES as readonly string[]).includes(code);
}

// Formats an amount already in MAJOR units (whole dollars/pounds/etc, not
// kobo/cents) of the given currency — used at /pay/[id] and the Flutterwave
// button.
export function formatMajorAmount(amount: number, currency: string): string {
  const meta = CURRENCIES.find((c) => c.code === currency);
  const symbol = meta?.symbol ?? `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Minor-unit helpers for the internationalAgreedAmount/internationalDepositAmount/
// internationalAmountPaid fields on Booking (kobo's equivalent, but for
// whatever currency the booking is actually in). Every currency in
// BOOKING_CURRENCY_CODES uses 2 decimal places today; kept as a lookup
// rather than a hardcoded /100 so a future zero-decimal currency (e.g. JPY)
// can't silently corrupt amounts if this list ever grows to include one.
const ZERO_DECIMAL_CURRENCIES = new Set<string>([]);

export function minorUnitsPerMajor(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100;
}

export function toMinorUnits(majorAmount: number, currency: string): number {
  return Math.round(majorAmount * minorUnitsPerMajor(currency));
}

export function fromMinorUnits(minorAmount: number, currency: string): number {
  return minorAmount / minorUnitsPerMajor(currency);
}
