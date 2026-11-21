import { prisma } from "@/lib/prisma";
import { TOKEN_PATTERN } from "@/lib/receipts";

export type ReceiptView = {
  token: string;
  number: number;
  issuedAt: Date;
  clientName: string;
  service: string;
  currency: string;
  method: string;
  reference: string;
  amount: number;
  agreedTotal: number;
  paidBefore: number;
  paidAfter: number;
  balance: number;
  invoiceToken: string;
};

export type InvoiceView = {
  token: string;
  number: number;
  issuedAt: Date;
  clientName: string;
  email: string;
  service: string;
  currency: string;
  agreedTotal: number;
  paid: number;
  balance: number;
  payments: { number: number; token: string; date: Date; method: string; amount: number }[];
};

function totals(b: {
  currency: string;
  agreedAmount: number | null;
  internationalAgreedAmount: number | null;
}) {
  const ngn = b.currency === "NGN";
  return ngn ? b.agreedAmount ?? 0 : b.internationalAgreedAmount ?? 0;
}

export async function loadReceipt(token: string): Promise<ReceiptView | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const payment = await prisma.bookingPayment.findUnique({
    where: { receiptToken: token },
    include: { booking: { include: { payments: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } } } },
  });
  if (!payment) return null;
  const b = payment.booking;
  let paidBefore = 0;
  for (const p of b.payments) {
    if (p.id === payment.id) break;
    paidBefore += p.amount;
  }
  const agreedTotal = totals(b);
  const paidAfter = paidBefore + payment.amount;
  return {
    token: payment.receiptToken,
    number: payment.receiptNumber,
    issuedAt: payment.createdAt,
    clientName: b.fullName,
    service: b.serviceInterest,
    currency: b.currency,
    method: payment.provider,
    reference: payment.reference,
    amount: payment.amount,
    agreedTotal,
    paidBefore,
    paidAfter,
    balance: Math.max(0, agreedTotal - paidAfter),
    invoiceToken: b.invoiceToken,
  };
}

export async function loadInvoice(token: string): Promise<InvoiceView | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const b = await prisma.booking.findUnique({
    where: { invoiceToken: token },
    include: { payments: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } },
  });
  if (!b) return null;
  const agreedTotal = totals(b);
  const paid = b.payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    token: b.invoiceToken,
    number: b.invoiceNumber,
    issuedAt: b.confirmedAt ?? b.createdAt,
    clientName: b.fullName,
    email: b.email,
    service: b.serviceInterest,
    currency: b.currency,
    agreedTotal,
    paid,
    balance: Math.max(0, agreedTotal - paid),
    payments: b.payments.map((p) => ({
      number: p.receiptNumber,
      token: p.receiptToken,
      date: p.createdAt,
      method: p.provider,
      amount: p.amount,
    })),
  };
}

export async function loadReceiptByReference(reference: string): Promise<ReceiptView | null> {
  const payment = await prisma.bookingPayment.findUnique({ where: { reference }, select: { receiptToken: true } });
  return payment ? loadReceipt(payment.receiptToken) : null;
}
