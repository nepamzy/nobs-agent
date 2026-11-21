import Link from "next/link";
import Image from "next/image";
import { Download, ShieldCheck } from "lucide-react";
import type { InvoiceView, ReceiptView } from "@/lib/receipt-data";
import { invoiceCode, money, paymentMethodLabel, receiptCode } from "@/lib/receipts";

// The page a QR code opens. A white "paper" card on the dark site so it reads
// like a real receipt and prints cleanly. Public by design (the long random
// token in the address is the key) and shows no email, phone or card detail.

const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function Shell({ kind, code, children, pdfHref, qrSrc, qrCaption }: {
  kind: string;
  code: string;
  children: React.ReactNode;
  pdfHref: string;
  qrSrc: string;
  qrCaption: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="overflow-hidden rounded-2xl bg-[#f6f5f1] text-[#0b0d12] shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between gap-4 bg-[#0b0d12] px-6 py-5">
          <div className="flex items-center gap-3">
            <Image src="/logo-mark.svg" alt="" width={44} height={44} />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">NOBS AGENT</p>
              <p className="text-[10px] font-semibold tracking-widest text-[#e4b343]">REAL SYSTEMS, NOT TEMPLATES.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#e4b343]">{kind}</p>
            <p className="font-[family-name:var(--font-mono)] text-base font-semibold text-white">{code}</p>
          </div>
        </div>
        <div className="h-1 bg-[#e4b343]" />

        <div className="p-6 sm:p-8">{children}</div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e0dcd0] bg-white/60 px-6 py-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrSrc} alt={`QR code for ${code}`} width={84} height={84} className="rounded-md border border-[#e0dcd0] bg-white" />
            <div className="max-w-[16rem] text-xs text-[#5d6270]">
              <p className="flex items-center gap-1.5 font-semibold text-[#0b0d12]">
                <ShieldCheck size={14} className="text-emerald-600" /> {qrCaption}
              </p>
              <p className="mt-1">You are looking at the real record on nobs-agent.site.</p>
            </div>
          </div>
          <a
            href={pdfHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#0b0d12] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Download size={15} /> Download PDF
          </a>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-[var(--color-slate)]">
        NOBS AGENT, Kaduna, Nigeria, remote-first. Questions? nobsagent0@gmail.com
      </p>
    </div>
  );
}

function Row({ k, v, strong, accent }: { k: string; v: string; strong?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#e0dcd0] py-2.5 text-sm">
      <span className="text-[#5d6270]">{k}</span>
      <span className={`${strong ? "font-semibold" : ""} ${accent ? "text-emerald-700" : ""}`}>{v}</span>
    </div>
  );
}

export function ReceiptDocument({ r }: { r: ReceiptView }) {
  const paidInFull = r.balance === 0 && r.agreedTotal > 0;
  return (
    <Shell
      kind="Payment receipt"
      code={receiptCode(r.number)}
      pdfHref={`/receipt/${r.token}/pdf`}
      qrSrc={`/receipt/${r.token}/qr`}
      qrCaption="Verified receipt"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Received from</p>
          <p className="mt-1 text-lg font-semibold">{r.clientName}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">For</p>
          <p className="mt-1 text-sm">{r.service}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Date</p>
          <p className="mt-1 text-sm">{day(r.issuedAt)}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Payment method</p>
          <p className="mt-1 text-sm">{paymentMethodLabel(r.method)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4b343] bg-[#f6f5f1] p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Amount received</p>
          <p className="mt-1 font-[family-name:var(--font-mono)] text-3xl font-semibold">{money(r.amount, r.currency)}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${paidInFull ? "bg-emerald-600" : "bg-[#a5822f]"}`}
        >
          {paidInFull ? "PAID IN FULL" : "PART PAYMENT"}
        </span>
      </div>

      <div className="mt-4">
        <Row k="Agreed project total" v={money(r.agreedTotal, r.currency)} />
        <Row k="Paid before this payment" v={money(r.paidBefore, r.currency)} />
        <Row k="This payment" v={money(r.amount, r.currency)} strong />
        <Row k="Total paid to date" v={money(r.paidAfter, r.currency)} />
        <Row k="Balance remaining" v={paidInFull ? "Paid in full" : money(r.balance, r.currency)} strong accent={paidInFull} />
      </div>

      <p className="mt-4 text-xs text-[#5d6270]">
        Reference <span className="font-[family-name:var(--font-mono)]">{r.reference}</span>
      </p>
      <Link href={`/invoice/${r.invoiceToken}`} className="mt-3 inline-block text-sm font-medium text-[#a5822f] underline underline-offset-4">
        View the full invoice for this project
      </Link>
    </Shell>
  );
}

export function InvoiceDocument({ inv }: { inv: InvoiceView }) {
  const paidInFull = inv.balance === 0 && inv.agreedTotal > 0;
  return (
    <Shell
      kind="Invoice"
      code={invoiceCode(inv.number)}
      pdfHref={`/invoice/${inv.token}/pdf`}
      qrSrc={`/invoice/${inv.token}/qr`}
      qrCaption="Verified invoice"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Billed to</p>
          <p className="mt-1 text-lg font-semibold">{inv.clientName}</p>
          <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Project</p>
          <p className="mt-1 text-sm">{inv.service}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#5d6270]">Date issued</p>
          <p className="mt-1 text-sm">{day(inv.issuedAt)}</p>
          <span
            className={`mt-3 inline-block rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
              paidInFull ? "bg-emerald-600" : inv.paid > 0 ? "bg-[#a5822f]" : "bg-[#5d6270]"
            }`}
          >
            {paidInFull ? "PAID IN FULL" : inv.paid > 0 ? "PART PAID" : "UNPAID"}
          </span>
        </div>
      </div>

      <p className="mt-6 text-sm font-semibold">Payments received</p>
      <div className="mt-2 overflow-hidden rounded-xl border border-[#e0dcd0]">
        {inv.payments.length === 0 ? (
          <p className="p-4 text-sm text-[#5d6270]">No payments recorded yet.</p>
        ) : (
          inv.payments.map((p) => (
            <Link
              key={p.token}
              href={`/receipt/${p.token}`}
              className="flex items-center justify-between gap-3 border-b border-[#e0dcd0] px-4 py-3 text-sm last:border-b-0 hover:bg-white"
            >
              <span>
                <span className="font-[family-name:var(--font-mono)] text-xs font-semibold">{receiptCode(p.number)}</span>
                <span className="ml-2 text-[#5d6270]">
                  {p.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {paymentMethodLabel(p.method)}
                </span>
              </span>
              <span className="font-semibold">{money(p.amount, inv.currency)}</span>
            </Link>
          ))
        )}
      </div>

      <div className="mt-4">
        <Row k="Project total" v={money(inv.agreedTotal, inv.currency)} />
        <Row k="Paid to date" v={money(inv.paid, inv.currency)} />
        <Row k="Balance due" v={paidInFull ? "Paid in full" : money(inv.balance, inv.currency)} strong accent={paidInFull} />
      </div>
    </Shell>
  );
}
