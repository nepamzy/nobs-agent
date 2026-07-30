import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateBookingStatus, confirmBookingWithDeposit } from "./actions";
import { Check, X, CreditCard, CheckCircle2 } from "lucide-react";

type BookingRow = Awaited<ReturnType<typeof prisma.booking.findMany>>[number];

async function getBookings() {
  try {
    const rows = await prisma.booking.findMany({ orderBy: { scheduledFor: "asc" }, take: 50 });
    return { rows, connected: true };
  } catch {
    return { rows: [] as BookingRow[], connected: false };
  }
}

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

export default async function AdminBookingsPage() {
  const { rows, connected } = await getBookings();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Bookings
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Consultation requests from the booking form. Confirming with a price emails the
        client a deposit payment link automatically.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, bookings will appear here once{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> is live.
        </div>
      )}

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">No booking requests yet.</p>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
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
              <span
                className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[row.status] ?? ""}`}
              >
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
                    <label className="mb-1 block text-[11px] text-[var(--color-slate)]">
                      Agreed price (₦)
                    </label>
                    <input
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
                    <label className="mb-1 block text-[11px] text-[var(--color-slate)]">
                      Deposit % (min 45)
                    </label>
                    <input
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
