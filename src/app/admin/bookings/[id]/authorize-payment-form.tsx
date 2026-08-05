"use client";

import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { authorizeBookingPayment } from "../actions";

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export function AuthorizePaymentForm({
  bookingId,
  hasAgreedAmount,
  priorStatus,
  agreedAmount,
  amountPaid,
}: {
  bookingId: string;
  hasAgreedAmount: boolean;
  priorStatus: string;
  agreedAmount: number | null;
  amountPaid: number;
}) {
  const [mode, setMode] = useState<"amount" | "percentage">("amount");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const remainingKobo = agreedAmount ? Math.max(0, agreedAmount - amountPaid) : null;
  const percentPaid = agreedAmount && agreedAmount > 0 ? Math.round((amountPaid / agreedAmount) * 100) : 0;
  const remainingPercent = 100 - percentPaid;
  const remainingNaira = remainingKobo !== null ? remainingKobo / 100 : undefined;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    // Client-side guard against overpaying past what's actually owed,
    // the server enforces this too, this just gives faster feedback.
    if (hasAgreedAmount && remainingKobo !== null) {
      const rawValue = Number(formData.get("value"));
      const attemptedKobo = mode === "amount" ? rawValue * 100 : (rawValue / 100) * (agreedAmount ?? 0);
      if (attemptedKobo > remainingKobo + 1) {
        setError(
          mode === "amount"
            ? `This can't exceed the remaining balance of ${formatNaira(remainingKobo)}.`
            : `This can't exceed the remaining ${remainingPercent}%.`
        );
        setLoading(false);
        return;
      }
    }

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

      {hasAgreedAmount && agreedAmount && (
        <div className="rounded-lg bg-white/5 p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-slate)]">Paid</span>
            <span className="font-medium">
              {formatNaira(amountPaid)} ({percentPaid}%)
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[var(--color-slate)]">Remaining</span>
            <span className="font-medium text-[var(--color-brass)]">
              {formatNaira(remainingKobo ?? 0)} ({remainingPercent}%)
            </span>
          </div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--color-brass)] transition-all"
              style={{ width: `${Math.min(100, percentPaid)}%` }}
            />
          </div>
        </div>
      )}

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
          {hasAgreedAmount &&
            (mode === "amount"
              ? `, max ${formatNaira(remainingKobo ?? 0)}`
              : `, max ${remainingPercent}%`)}
        </label>
        <input
          name="value"
          type="number"
          min={mode === "amount" ? 1 : 0.01}
          max={
            hasAgreedAmount
              ? mode === "percentage"
                ? remainingPercent
                : remainingNaira
              : mode === "percentage"
                ? 100
                : undefined
          }
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
