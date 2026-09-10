"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

// Sends the client to Paystack's own hosted checkout page and back,
// rather than the old Inline JS popup — required so the split percentage
// (base tier, bonus tier, or base + recruiter override) can be computed
// fresh per payment via Paystack's `split` object, which Inline JS can't
// carry, only a fixed `subaccount` (see src/lib/referral-split.ts). The
// server decides the actual split at /api/paystack/initialize; this
// component only ever sees an authorization_url to redirect to.
// Verification on return happens in payment-return-handler.tsx once
// Paystack sends the client back to /pay/[id]?verify=<reference>.
export function PayButton({
  bookingId,
  minimumKobo,
  remainingKobo,
}: {
  bookingId: string;
  minimumKobo: number; // the floor for this specific payment
  remainingKobo: number; // the ceiling, can't pay more than what's left
}) {
  const [amountNaira, setAmountNaira] = useState(Math.round(remainingKobo / 100));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, amountKobo }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.authorizationUrl;
      // Deliberately no setLoading(false) on success — the page is
      // navigating away, staying in the loading state avoids a flash of
      // the button becoming clickable again during that navigation.
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
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
        {loading ? "Redirecting to secure checkout…" : `Pay ${formatNaira(Math.round(amountNaira * 100))}`}
      </button>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
