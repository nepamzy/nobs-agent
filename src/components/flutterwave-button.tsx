"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

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

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function FlutterwaveButton({
  bookingId,
  email,
  name,
  minimumKobo,
  remainingKobo,
  onPaid,
}: {
  bookingId: string;
  email: string;
  name: string;
  minimumKobo: number;
  remainingKobo: number;
  onPaid?: (totalPaid: number) => void;
}) {
  const [amountNaira, setAmountNaira] = useState(Math.round(remainingKobo / 100));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    setError(null);

    const amountKobo = Math.round(amountNaira * 100);
    if (amountKobo < minimumKobo) {
      setError(`This payment must be at least ${formatNaira(minimumKobo)}.`);
      return;
    }
    if (amountKobo > remainingKobo) {
      setError(`This payment can't exceed the remaining balance of ${formatNaira(remainingKobo)}.`);
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
        amount: amountNaira,
        currency: "NGN",
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

  const isFullBalance = minimumKobo === remainingKobo;

  return (
    <div>
      {!isFullBalance && (
        <div className="mb-4">
          <label htmlFor="flutterwave-amount" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Amount to pay now
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-slate)]">₦</span>
            <input
              id="flutterwave-amount"
              type="number"
              value={amountNaira}
              onChange={(e) => setAmountNaira(Number(e.target.value))}
              min={Math.round(minimumKobo / 100)}
              max={Math.round(remainingKobo / 100)}
              step="1"
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
