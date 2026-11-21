import { prisma } from "@/lib/prisma";
import { clearAllPaymentData } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { CreditCard, Banknote } from "lucide-react";
import { PaymentsBoard, type BoardBooking, type BoardClient } from "@/components/admin/payments-board";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

async function getData() {
  try {
    const [rows, clients] = await Promise.all([
      prisma.booking.findMany({
        where: { status: { notIn: ["CANCELLED", "REJECTED"] } },
        orderBy: { createdAt: "desc" },
        take: 300,
        include: { client: { select: { name: true } }, payments: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, organization: true } }),
    ]);
    return { rows, clients, connected: true };
  } catch {
    return { rows: [], clients: [] as BoardClient[], connected: false };
  }
}

export default async function AdminPaymentsPage() {
  const { rows, clients, connected } = await getData();

  // Naira bookings only: the headline totals add up one currency.
  const ngn = rows.filter((r) => r.currency === "NGN");
  const totalCollected = ngn.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalOutstanding = ngn.reduce(
    (sum, r) => sum + Math.max(0, (r.agreedAmount ?? 0) - r.amountPaid),
    0
  );

  const board: BoardBooking[] = rows
    .map((r) => ({
      id: r.id,
      fullName: r.fullName,
      email: r.email,
      service: r.serviceInterest,
      currency: r.currency,
      agreedTotal: r.currency === "NGN" ? r.agreedAmount : r.internationalAgreedAmount,
      paid: r.payments.reduce((sum, p) => sum + p.amount, 0),
      clientId: r.clientId,
      clientName: r.client?.name ?? null,
      invoiceNumber: r.invoiceNumber,
      invoiceToken: r.invoiceToken,
      payments: r.payments.map((p) => ({
        id: p.id,
        number: p.receiptNumber,
        token: p.receiptToken,
        date: p.createdAt.toISOString(),
        method: p.provider,
        amount: p.amount,
        note: p.note,
      })),
    }))
    // Bookings that still need attention first: no price, then part paid.
    .sort((a, b) => Number(a.agreedTotal !== null) - Number(b.agreedTotal !== null));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
            Payments
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-slate)]">
            Agree a price, approve money you have received, link a booking to a client, and
            download a numbered receipt or invoice with a QR code for any payment, past or new.
          </p>
        </div>
        <form action={clearAllPaymentData}>
          <ConfirmSubmit
            message='This permanently deletes every payment record and resets every "amount paid" figure across the entire site back to zero, including analytics revenue, client totals, and invoices. This cannot be undone. Only do this if every payment currently on file is test data. Continue?'
            title="Clear all payment data"
            className="shrink-0 rounded-full border border-red-500/40 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10"
          >
            Clear all payment data
          </ConfirmSubmit>
        </form>
      </div>

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

      <PaymentsBoard bookings={board} clients={clients} />
    </div>
  );
}
