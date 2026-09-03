"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Paystack."));
    document.body.appendChild(script);
  });
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function PayButton({
  bookingId,
  email,
  minimumKobo,
  remainingKobo,
  onPaid,
}: {
  bookingId: string;
  email: string;
  minimumKobo: number; // the floor for this specific payment
  remainingKobo: number; // the ceiling, can't pay more than what's left
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

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
      setError("Payments aren't configured yet, contact the studio directly.");
      setLoading(false);
      return;
    }

    try {
      await loadPaystackScript();

      const reference = `nobs-${bookingId}-${Date.now()}`;

      const handler = window.PaystackPop!.setup({
        key: publicKey,
        email,
        amount: amountKobo,
        ref: reference,
        currency: "NGN",
        metadata: { bookingId },
        callback: (response) => {
          // Paystack confirms client-side, but that's never trusted alone,
          // the server independently re-verifies with Paystack's API
          // (including the actual amount) before marking anything paid.
          fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reference: response.reference, bookingId }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.ok) {
                setSuccess(true);
                onPaid?.(data.totalPaid);
              } else {
                setError(data.error ?? "Payment could not be verified. Contact the studio.");
              }
            })
            .catch(() => setError("Payment could not be verified. Contact the studio."))
            .finally(() => setLoading(false));
        },
        onClose: () => setLoading(false),
      });

      handler.openIframe();
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
          <label htmlFor="pay-button-amount" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
            Amount to pay now
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-slate)]">₦</span>
            <input
              id="pay-button-amount"
              type="number"
              value={amountNaira}
              onChange={(e) => setAmountNaira(Number(e.target.value))}
              min={Math.round(minimumKobo / 100)}
              max={Math.round(remainingKobo / 100)}
              step="1"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
          </div>
          <p className="mt-1.5 text-xs text-[var(--color-slate)]">
            Minimum {formatNaira(minimumKobo)}, up to the full remaining balance of {formatNaira(remainingKobo)}.
          </p>
        </div>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
        {loading ? "Opening secure checkout…" : `Pay ${formatNaira(Math.round(amountNaira * 100))}`}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
