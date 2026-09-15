"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { formatMajorAmount } from "@/lib/booking-currencies";

declare global {
  interface Window {
    FlutterwaveCheckout?: (config: {
      public_key: string;
      tx_ref: string;
      amount: number;
      currency: string;
      payment_options?: string;
      customer: { email: string; name: string };
      customizations?: { title?: string; description?: string };
      callback: (data: { transaction_id: string | number; status: string }) => void;
      onclose: () => void;
    }) => void;
  }
}

function loadFlutterwaveScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FlutterwaveCheckout) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Flutterwave."));
    document.body.appendChild(script);
  });
}

export function FlutterwaveButton({
  bookingId,
  email,
  name,
  currency,
  minimumMajor,
  remainingMajor,
  onPaid,
}: {
  bookingId: string;
  email: string;
  name: string;
  // Booking's fixed payment currency (see prisma Booking.currency) and the
  // deposit floor / remaining balance already converted into that
  // currency's MAJOR units (whole dollars/pounds/etc, not kobo/cents) —
  // computed server-side at /pay/[id] from the real NGN-kobo figures, see
  // src/lib/exchange-rates.ts. Never NGN here for the currency !== "NGN"
  // case; NGN bookings keep using Paystack by default (see
  // payment-provider-select.tsx) and only reach this component if staff or
  // the client explicitly pick Flutterwave for an NGN booking, still true
  // to naira in that case.
  currency: string;
  minimumMajor: number;
  remainingMajor: number;
  onPaid?: (totalPaid: number) => void;
}) {
  const [amountMajor, setAmountMajor] = useState(remainingMajor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    setError(null);

    // A tiny epsilon guards against float rounding on converted amounts
    // (e.g. 44.999999999 from a division chain) incorrectly tripping the
    // "below minimum" check.
    if (amountMajor < minimumMajor - 0.01) {
      setError(`This payment must be at least ${formatMajorAmount(minimumMajor, currency)}.`);
      return;
    }
    if (amountMajor > remainingMajor + 0.01) {
      setError(`This payment can't exceed the remaining balance of ${formatMajorAmount(remainingMajor, currency)}.`);
      return;
    }

    setLoading(true);

    const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
    if (!publicKey) {
      setError("Flutterwave isn't configured yet, try Paystack instead.");
      setLoading(false);
      return;
    }

    try {
      await loadFlutterwaveScript();

      const txRef = `nobs-${bookingId}-${Date.now()}`;

      window.FlutterwaveCheckout!({
        public_key: publicKey,
        tx_ref: txRef,
        amount: amountMajor,
        currency,
        payment_options: "card, banktransfer, ussd",
        customer: { email, name },
        customizations: { title: "NOBS AGENT", description: "Project payment" },
        callback: (data) => {
          fetch("/api/flutterwave/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: String(data.transaction_id), bookingId }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (result.ok) {
                setSuccess(true);
                onPaid?.(result.totalPaid);
              } else {
                setError(result.error ?? "Payment could not be verified. Contact the studio.");
              }
            })
            .catch(() => setError("Payment could not be verified. Contact the studio."))
            .finally(() => setLoading(false));
        },
        onclose: () => setLoading(false),
      });
    } catch {
      setError("Could not open the payment window. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
        Payment received, thank you. A receipt is on its way to your email.
      </p>
    );
  }

  const isFullBalance = minimumMajor === remainingMajor;

  return (
    <div>
      {!isFullBalance && (
        <div className="mb-4">
          <label htmlFor="flutterwave-amount" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Amount to pay now
          </label>
          <div className="flex items-center gap-2">
            <input
              id="flutterwave-amount"
              type="number"
              value={amountMajor}
              onChange={(e) => setAmountMajor(Number(e.target.value))}
              min={minimumMajor}
              max={remainingMajor}
              step="0.01"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
          </div>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-6 py-3 text-sm font-medium transition hover:border-[var(--color-brass)] disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {loading ? "Opening secure checkout…" : `Pay with Flutterwave`}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
