import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, CreditCard, Banknote, FileDown } from "lucide-react";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

async function getBookingsWithDeposits() {
  try {
    const rows = await prisma.booking.findMany({
      where: { agreedAmount: { not: null } },
      orderBy: { scheduledFor: "desc" },
    });
    return { rows, connected: true };
  } catch {
    return { rows: [] as Awaited<ReturnType<typeof prisma.booking.findMany>>, connected: false };
  }
}

export default async function AdminPaymentsPage() {
  const { rows, connected } = await getBookingsWithDeposits();

  const totalCollected = rows.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalOutstanding = rows.reduce(
    (sum, r) => sum + Math.max(0, (r.agreedAmount ?? 0) - r.amountPaid),
    0
  );

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Payments
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-slate)]">
        Every payment, deposit and installments alike, collected via Paystack. Clients
        can pay in parts, this reflects the running total across all of them.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-slate)]">
            <Banknote size={14} /> Collected
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-2xl text-emerald-400">
            {formatNaira(totalCollected)}
          </p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--color-slate)]">
            <CreditCard size={14} /> Outstanding
          </p>
          <p className="mt-2 font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)]">
            {formatNaira(totalOutstanding)}
          </p>
        </div>
      </div>

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          No confirmed bookings with a price yet, set one in{" "}
          <Link href="/admin/bookings" className="text-[var(--color-brass)] underline underline-offset-4">
            Bookings
          </Link>
          .
        </p>
      )}

      <div className="mt-6 space-y-2">
        {rows.map((row) => {
          const total = row.agreedAmount ?? 0;
          const percent = total > 0 ? Math.round((row.amountPaid / total) * 100) : 0;
          const fullyPaid = total > 0 && row.amountPaid >= total;
          return (
            <div key={row.id} className="glass rounded-xl p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <p className="font-medium">{row.fullName}</p>
                  <p className="text-xs text-[var(--color-slate)]">
                    {row.serviceInterest} · {formatNaira(row.amountPaid)} of {formatNaira(total)} ({percent}%)
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {row.amountPaid > 0 && (
                    <a
                      href={`/api/invoice/${row.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-2.5 py-1.5 text-xs transition hover:border-[var(--color-brass)]"
                    >
                      <FileDown size={12} /> Invoice
                    </a>
                  )}
                  {fullyPaid ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={14} /> Paid in full
                    </span>
                  ) : row.amountPaid > 0 ? (
                    <span className="text-[var(--color-brass)]">In progress</span>
                  ) : (
                    <span className="text-[var(--color-slate)]">Awaiting first payment</span>
                  )}
                </div>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--color-brass)] transition-all"
                  style={{ width: `${Math.min(100, percent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
