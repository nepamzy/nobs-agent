"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { CheckCircle2, FileDown, ExternalLink, Link2 } from "lucide-react";
import {
  approvePaymentAction,
  linkClientAction,
  setPriceAction,
  type PaymentFormState,
} from "@/app/admin/payments/actions";
import { invoiceCode, money, paymentMethodLabel, receiptCode } from "@/lib/receipts";

export type BoardPayment = { id: string; number: number; token: string; date: string; method: string; amount: number; note: string | null };
export type BoardBooking = {
  id: string;
  fullName: string;
  email: string;
  service: string;
  currency: string;
  agreedTotal: number | null;
  paid: number;
  clientId: string | null;
  clientName: string | null;
  invoiceNumber: number;
  invoiceToken: string;
  payments: BoardPayment[];
};
export type BoardClient = { id: string; name: string; organization: string | null };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]";
const labelClass = "mb-1 block text-[11px] font-medium text-[var(--color-slate)]";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--color-brass)] px-4 py-2 text-xs font-semibold text-[var(--color-ink)] transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Saving…" : children}
    </button>
  );
}

function Notice({ state }: { state: PaymentFormState }) {
  if (!state) return null;
  return state.ok ? (
    <p className="mt-2 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">{state.message}</p>
  ) : (
    <p className="mt-2 rounded-lg border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs text-red-300">{state.error}</p>
  );
}

function SetPriceForm({ id }: { id: string }) {
  const [state, action] = useActionState<PaymentFormState, FormData>(setPriceAction, undefined);
  return (
    <form action={action} className="rounded-xl border border-white/10 p-4">
      <p className="text-sm font-medium">1. Agree the price</p>
      <p className="mt-1 text-xs text-[var(--color-slate)]">
        Enter what you and the client agreed. They get an email with a link to pay the deposit.
      </p>
      <input type="hidden" name="id" value={id} />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px_auto] sm:items-end">
        <div>
          <label className={labelClass}>Agreed price (₦)</label>
          <input name="agreedAmountNaira" type="number" min={1} step="any" inputMode="decimal" placeholder="e.g. 450000" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Deposit %</label>
          <input name="depositPercentage" type="number" min={45} max={100} defaultValue={45} className={inputClass} />
        </div>
        <Submit>Save price</Submit>
      </div>
      <Notice state={state} />
    </form>
  );
}

function ApproveForm({ b }: { b: BoardBooking }) {
  const [state, action] = useActionState<PaymentFormState, FormData>(approvePaymentAction, undefined);
  const needsPrice = b.agreedTotal === null;
  const remaining = b.agreedTotal === null ? null : Math.max(0, b.agreedTotal - b.paid);
  return (
    <form action={action} className="rounded-xl border border-white/10 p-4">
      <p className="text-sm font-medium">{needsPrice ? "Or approve a payment now" : "Approve a payment"}</p>
      <p className="mt-1 text-xs text-[var(--color-slate)]">
        For money you have already received (a bank transfer or cash). Type the amount and approve it: a numbered receipt with a QR code is made straight away.
        {remaining !== null && remaining > 0 ? ` Up to ${money(remaining, b.currency)} is still due.` : ""}
      </p>
      <input type="hidden" name="id" value={b.id} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Amount received (₦)</label>
          <input name="amountNaira" type="number" min={1} step="any" inputMode="decimal" required placeholder="e.g. 200000" className={inputClass} />
        </div>
        {needsPrice && (
          <div>
            <label className={labelClass}>Agreed total price (₦)</label>
            <input name="agreedAmountNaira" type="number" min={1} step="any" inputMode="decimal" required placeholder="Total for the whole project" className={inputClass} />
          </div>
        )}
        <div className={needsPrice ? "sm:col-span-2" : ""}>
          <label className={labelClass}>Note (optional)</label>
          <input name="note" maxLength={1000} placeholder="e.g. Bank transfer, GTBank, 21 Nov" className={inputClass} />
        </div>
      </div>
      <div className="mt-3">
        <Submit>Approve payment</Submit>
      </div>
      <Notice state={state} />
    </form>
  );
}

function LinkClientForm({ b, clients }: { b: BoardBooking; clients: BoardClient[] }) {
  const [state, action] = useActionState<PaymentFormState, FormData>(linkClientAction, undefined);
  return (
    <form action={action} className="rounded-xl border border-white/10 p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium">
        <Link2 size={14} /> Client
      </p>
      <p className="mt-1 text-xs text-[var(--color-slate)]">
        {b.clientName ? `Linked to ${b.clientName}.` : "Not linked to a client yet."} Linking puts this booking, its invoice and receipts on that client&apos;s record.
      </p>
      <input type="hidden" name="id" value={b.id} />
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className={labelClass}>Choose a client</label>
          <select key={b.clientId ?? "none"} name="clientId" defaultValue={b.clientId ?? ""} className={inputClass}>
            <option value="">No client (unlink)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.organization ? ` · ${c.organization}` : ""}
              </option>
            ))}
          </select>
        </div>
        <Submit>Save client</Submit>
      </div>
      <Notice state={state} />
    </form>
  );
}

function BookingCard({ b, clients }: { b: BoardBooking; clients: BoardClient[] }) {
  // Kept in state so the card stays open after a form saves and the page
  // refreshes with new numbers; the success message would otherwise vanish.
  const [open, setOpen] = useState(b.agreedTotal === null || b.paid === 0);
        const total = b.agreedTotal ?? 0;
        const percent = total > 0 ? Math.min(100, Math.round((b.paid / total) * 100)) : 0;
        const fullyPaid = total > 0 && b.paid >= total;
        const isNgn = b.currency === "NGN";
        return (
          <details className="glass rounded-xl p-4 text-sm" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {b.fullName}
                    {b.clientName ? (
                      <span className="ml-2 rounded-full border border-[var(--color-teal)]/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-teal)]">
                        Client: {b.clientName}
                      </span>
                    ) : (
                      <span className="ml-2 rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-slate)]">
                        Not linked
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-slate)]">
                    {b.service} ·{" "}
                    {b.agreedTotal === null ? "No price agreed yet" : `${money(b.paid, b.currency)} of ${money(total, b.currency)} (${percent}%)`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {b.agreedTotal !== null && (
                    <a
                      href={`/invoice/${b.invoiceToken}/pdf`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-2.5 py-1.5 text-xs transition hover:border-[var(--color-brass)]"
                    >
                      <FileDown size={12} /> Invoice {invoiceCode(b.invoiceNumber)}
                    </a>
                  )}
                  {fullyPaid ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={14} /> Paid in full
                    </span>
                  ) : b.paid > 0 ? (
                    <span className="text-[var(--color-brass)]">In progress</span>
                  ) : (
                    <span className="text-[var(--color-slate)]">Awaiting payment</span>
                  )}
                </div>
              </div>
              {b.agreedTotal !== null && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--color-brass)]" style={{ width: `${percent}%` }} />
                </div>
              )}
            </summary>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {!isNgn ? (
                <div className="rounded-xl border border-white/10 p-4 text-xs text-[var(--color-slate)] lg:col-span-2">
                  This booking is in {b.currency}. Set its price and record payments from{" "}
                  <Link href={`/admin/bookings/${b.id}`} className="text-[var(--color-brass)] underline underline-offset-4">
                    the booking page
                  </Link>
                  . Its receipts and invoice still appear here.
                </div>
              ) : (
                <>
                  {b.agreedTotal === null && <SetPriceForm id={b.id} />}
                  {!fullyPaid && <ApproveForm b={b} />}
                </>
              )}
              <LinkClientForm b={b} clients={clients} />
            </div>

            {b.payments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-slate)]">Receipts</p>
                <div className="mt-2 space-y-1.5">
                  {b.payments.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                      <div>
                        <span className="font-[family-name:var(--font-mono)] text-xs font-semibold">{receiptCode(p.number)}</span>
                        <span className="ml-2 text-xs text-[var(--color-slate)]">
                          {new Date(p.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {paymentMethodLabel(p.method)}
                          {p.note ? ` · ${p.note}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{money(p.amount, b.currency)}</span>
                        <a
                          href={`/receipt/${p.token}/pdf`}
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-2 py-1 text-xs transition hover:border-[var(--color-brass)]"
                        >
                          <FileDown size={11} /> Receipt PDF
                        </a>
                        <Link
                          href={`/receipt/${p.token}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-line)] px-2 py-1 text-xs transition hover:border-[var(--color-brass)]"
                        >
                          <ExternalLink size={11} /> Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </details>
        );
}

export function PaymentsBoard({ bookings, clients }: { bookings: BoardBooking[]; clients: BoardClient[] }) {
  if (bookings.length === 0) {
    return <p className="mt-8 text-sm text-[var(--color-slate)]">No bookings to show yet.</p>;
  }
  return (
    <div className="mt-6 space-y-3">
      {bookings.map((b) => (
        <BookingCard key={b.id} b={b} clients={clients} />
      ))}
    </div>
  );
}
