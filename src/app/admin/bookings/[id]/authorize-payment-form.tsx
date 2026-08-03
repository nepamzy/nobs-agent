"use client";

import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { authorizeBookingPayment } from "./actions";

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]";

export function AuthorizePaymentForm({
  bookingId,
  hasAgreedAmount,
  priorStatus,
}: {
  bookingId: string;
  hasAgreedAmount: boolean;
  priorStatus: string;
}) {
  const [mode, setMode] = useState<"amount" | "percentage">("amount");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    try {
      await authorizeBookingPayment(formData);
      setSuccess(true);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-3 rounded-xl border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/5 p-4"
    >
      <input type="hidden" name="id" value={bookingId} />
      <input type="hidden" name="mode" value={mode} />

      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-brass)]">
        <ShieldCheck size={13} /> Authorize payment (admin override)
      </p>
      <p className="text-xs text-[var(--color-slate)]">
        Records a payment on your authority, independent of Paystack confirmation.
        {priorStatus === "FAILED" && " This booking's last known gateway status was FAILED."}
      </p>

      {!hasAgreedAmount && (
        <div>
          <label className="mb-1 block text-[11px] text-[var(--color-slate)]">
            Total project cost (₦), this booking has no agreed price yet
          </label>
          <input
            name="agreedAmountNaira"
            type="number"
            min={1}
            step="0.01"
            required
            placeholder="1500000"
            className={`${inputClass} w-full`}
          />
        </div>
      )}

      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode("amount")}
          className={`rounded-full px-3 py-1 transition ${
            mode === "amount"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Amount (₦)
        </button>
        <button
          type="button"
          onClick={() => setMode("percentage")}
          className={`rounded-full px-3 py-1 transition ${
            mode === "percentage"
              ? "bg-[var(--color-brass)] text-[var(--color-ink)]"
              : "border border-[var(--color-line)] text-[var(--color-slate)]"
          }`}
        >
          Percentage (%)
        </button>
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-[var(--color-slate)]">
          {mode === "amount" ? "Amount paid this transaction (₦)" : "Percentage paid (%)"}
        </label>
        <input
          name="value"
          type="number"
          min={mode === "amount" ? 1 : 0.01}
          max={mode === "percentage" ? 100 : undefined}
          step="0.01"
          required
          className={`${inputClass} w-full`}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] text-[var(--color-slate)]">
          Note (optional, e.g. &quot;bank transfer, ref #123&quot;)
        </label>
        <input name="note" type="text" maxLength={1000} className={`${inputClass} w-full`} />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">Payment authorized and receipt sent.</p>}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
      >
        {loading && <Loader2 size={13} className="animate-spin" />}
        {loading ? "Authorizing…" : "Authorize payment"}
      </button>
    </form>
  );
}
