"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Check, X, CreditCard, CheckCircle2 } from "lucide-react";

const statusStyles: Record<string, string> = {
  PENDING: "border-[var(--color-brass)]/50 text-[var(--color-brass)]",
  CONFIRMED: "border-emerald-500/50 text-emerald-400",
  REJECTED: "border-red-500/50 text-red-400",
  COMPLETED: "border-[var(--color-line)] text-[var(--color-slate)]",
  CANCELLED: "border-[var(--color-line)] text-[var(--color-slate)]",
};

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

type BookingRow = {
  id: string;
  fullName: string;
  email: string;
  serviceInterest: string;
  budgetRange: string;
  meetingType: string;
  scheduledFor: Date;
  status: string;
  agreedAmount: number | null;
  amountPaid: number;
};

export function BookingSearchList({
  rows,
  confirmBookingWithDeposit,
  updateBookingStatus,
}: {
  rows: BookingRow[];
  confirmBookingWithDeposit: (formData: FormData) => void;
  updateBookingStatus: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = rows.filter((row) => {
    const haystack = `${row.fullName} ${row.email} ${row.serviceInterest}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bookings by name, email, or service..."
          className={`${inputClass} w-full pl-9`}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">
          {rows.length === 0 ? "No booking requests yet." : "No bookings match that search."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((row) => (
          <div key={row.id} className="glass rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Link href={`/admin/bookings/${row.id}`} className="group">
                <p className="font-medium transition group-hover:text-[var(--color-brass)]">
                  {row.fullName} <span className="text-[var(--color-slate)]">· {row.email}</span>
                </p>
                <p className="mt-1 text-xs text-[var(--color-slate)]">
                  {row.serviceInterest} · {row.budgetRange} · {row.meetingType}
                </p>
                <p className="mt-1 text-xs text-[var(--color-slate)]">
                  Requested: {new Date(row.scheduledFor).toLocaleString()}
                </p>
              </Link>
              <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[row.status] ?? ""}`}>
                {row.status}
              </span>
            </div>

            {row.status === "PENDING" && (
              <>
                <form
                  action={confirmBookingWithDeposit}
                  className="mt-4 flex flex-wrap items-end gap-3 border-t border-[var(--color-line)] pt-4"
                >
                  <input type="hidden" name="id" value={row.id} />
                  <div>
                    <label htmlFor={`booking-${row.id}-agreed-amount`} className="mb-1 block text-[11px] text-[var(--color-slate)]">
                      Agreed price (₦)
                    </label>
                    <input
                      id={`booking-${row.id}-agreed-amount`}
                      name="agreedAmountNaira"
                      type="number"
                      min={1}
                      step="0.01"
                      required
                      placeholder="1500000"
                      className={`${inputClass} w-36`}
                    />
                  </div>
                  <div>
                    <label htmlFor={`booking-${row.id}-deposit-percentage`} className="mb-1 block text-[11px] text-[var(--color-slate)]">
                      Deposit % (min 45)
                    </label>
                    <input
                      id={`booking-${row.id}-deposit-percentage`}
                      name="depositPercentage"
                      type="number"
                      min={45}
                      max={100}
                      defaultValue={45}
                      required
                      className={`${inputClass} w-24`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-3 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:opacity-90"
                  >
                    <Check size={13} /> Confirm & send payment link
                  </button>
                </form>
                <form action={updateBookingStatus} className="mt-2">
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs font-medium transition hover:border-red-500/50 hover:text-red-400"
                  >
                    <X size={13} /> Decline
                  </button>
                </form>
              </>
            )}

            {row.status === "CONFIRMED" && row.agreedAmount && (
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--color-line)] pt-4 text-sm">
                <span className="text-[var(--color-slate)]">
                  {formatNaira(row.amountPaid)} of {formatNaira(row.agreedAmount)} paid (
                  {Math.round((row.amountPaid / row.agreedAmount) * 100)}%)
                </span>
                {row.amountPaid >= row.agreedAmount ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 size={14} /> Paid in full
                  </span>
                ) : row.amountPaid > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-brass)]">
                    <CreditCard size={14} /> Partially paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-brass)]">
                    <CreditCard size={14} /> Awaiting first payment, payment link sent
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
