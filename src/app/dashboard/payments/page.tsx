import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, CreditCard, FileDown } from "lucide-react";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

async function getBookings(email: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: { email, agreedAmount: { not: null } },
      orderBy: { createdAt: "desc" },
    });
    return { bookings, connected: true };
  } catch {
    return { bookings: [], connected: false };
  }
}

export default async function DashboardPaymentsPage() {
  const session = await auth();
  const { bookings, connected } = await getBookings(session!.user.email!);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Payments
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Deposits and payment history for your projects.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      {connected && bookings.length === 0 && (
        <div className="glass mt-6 rounded-2xl p-8 text-sm text-[var(--color-slate)]">
          No payments due right now. Once a project is confirmed with a price, it&apos;ll
          show up here.
        </div>
      )}

      <div className="mt-6 space-y-3">
        {bookings.map(
          (b: {
            id: string;
            serviceInterest: string;
            agreedAmount: number | null;
            depositAmount: number | null;
            depositPercentage: number | null;
            amountPaid: number;
          }) => {
            const total = b.agreedAmount ?? 0;
            const paid = b.amountPaid;
            const percent = total > 0 ? Math.round((paid / total) * 100) : 0;
            const fullyPaid = total > 0 && paid >= total;
            return (
              <div key={b.id} className="glass rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium">{b.serviceInterest}</p>
                    <p className="mt-1 text-xs text-[var(--color-slate)]">
                      {formatNaira(paid)} of {formatNaira(total)} paid ({percent}%)
                      {!fullyPaid && `, ${formatNaira(total - paid)} remaining`}
                    </p>
                    <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[var(--color-brass)] transition-all"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {paid > 0 && (
                      <a
                        href={`/api/invoice/${b.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
                      >
                        <FileDown size={13} /> Invoice
                      </a>
                    )}
                    {fullyPaid ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-400">
                        <CheckCircle2 size={13} /> Paid in full
                      </span>
                    ) : (
                      <Link
                        href={`/pay/${b.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-xs font-medium text-[var(--color-ink)] transition hover:opacity-90"
                      >
                        <CreditCard size={13} /> {paid > 0 ? "Continue payment" : "Pay now"}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
