"use client";

import { useState } from "react";
import { PayButton } from "@/components/pay-button";
import { FlutterwaveButton } from "@/components/flutterwave-button";

// Paystack only ever settles in NGN (see src/app/api/paystack/initialize/route.ts),
// so a booking paid in any other currency skips the provider toggle
// entirely and goes straight to Flutterwave, charged in that real
// currency — not a naira estimate. NGN bookings keep the existing choice
// between the two, unchanged.
export function PaymentProviderSelect({
  bookingId,
  email,
  name,
  currency,
  minimumKobo,
  remainingKobo,
  minimumMajor,
  remainingMajor,
}: {
  bookingId: string;
  email: string;
  name: string;
  currency: string;
  // Always real NGN kobo — used directly for currency === "NGN".
  minimumKobo: number;
  remainingKobo: number;
  // Same balance, already converted into `currency`'s major units — only
  // meaningful (and only passed) when currency !== "NGN".
  minimumMajor?: number;
  remainingMajor?: number;
}) {
  const [provider, setProvider] = useState<"paystack" | "flutterwave">("paystack");

  if (currency !== "NGN") {
    return (
      <FlutterwaveButton
        bookingId={bookingId}
        email={email}
        name={name}
        currency={currency}
        minimumMajor={minimumMajor ?? 0}
        remainingMajor={remainingMajor ?? 0}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setProvider("paystack")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            provider === "paystack"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Paystack
        </button>
        <button
          type="button"
          onClick={() => setProvider("flutterwave")}
          className={`rounded-full px-4 py-2 text-xs font-medium transition ${
            provider === "flutterwave"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Flutterwave
        </button>
      </div>

      {provider === "paystack" ? (
        <PayButton bookingId={bookingId} minimumKobo={minimumKobo} remainingKobo={remainingKobo} />
      ) : (
        <FlutterwaveButton
          bookingId={bookingId}
          email={email}
          name={name}
          currency="NGN"
          minimumMajor={minimumKobo / 100}
          remainingMajor={remainingKobo / 100}
        />
      )}
    </div>
  );
}
