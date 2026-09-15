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
// button, where amounts are converted out of NGN kobo before display.
export function formatMajorAmount(amount: number, currency: string): string {
  const meta = CURRENCIES.find((c) => c.code === currency);
  const symbol = meta?.symbol ?? `${currency} `;
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
