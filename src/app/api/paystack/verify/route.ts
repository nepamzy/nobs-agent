import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { rateLimit } from "@/lib/rate-limit";
import { buildReceiptHtml } from "@/lib/receipt";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { recordReferralCommissionIfApplicable, type CommissionEmailData } from "@/lib/referral-commission";
import { buildCommissionEarnedHtml } from "@/lib/partner-email";

const verifySchema = z.object({
  reference: z.string().min(1),
  bookingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = rateLimit(`paystack-verify:${ip}`, 10, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { ok: false, error: "Payments aren't configured on the server yet." },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { reference, bookingId } = parsed.data;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || !booking.agreedAmount || !booking.depositAmount) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    // Idempotency: if this exact transaction was already recorded (e.g. the
    // client's browser retried after a network blip), don't double-count it.
    const existingPayment = await prisma.bookingPayment.findUnique({ where: { reference } });
    if (existingPayment) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    // The one step that actually matters: ask Paystack directly whether
    // this reference was really paid, and for how much. Never trust a
    // client-submitted amount, only what Paystack itself confirms.
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok || verifyJson?.data?.status !== "success") {
      return NextResponse.json(
        { ok: false, error: "Payment could not be verified." },
        { status: 400 }
      );
    }

    const paidAmount: number = verifyJson.data.amount;
    const remainingBefore = booking.agreedAmount - booking.amountPaid;
    const isFirstPayment = booking.amountPaid === 0;

    // Business rule enforcement, even though the checkout UI already tries
    // to prevent these, the server is the actual authority.
    if (isFirstPayment && paidAmount < booking.depositAmount) {
      return NextResponse.json(
        { ok: false, error: "First payment must meet the minimum deposit." },
        { status: 400 }
      );
    }
    if (paidAmount > remainingBefore) {
      return NextResponse.json(
        { ok: false, error: "Payment exceeds the remaining balance." },
        { status: 400 }
      );
    }

    const newTotalPaid = booking.amountPaid + paidAmount;

    let commissionEmailData: CommissionEmailData | null = null;
    await prisma.$transaction(async (tx) => {
      const payment = await tx.bookingPayment.create({
        data: { bookingId: booking.id, amount: paidAmount, provider: "paystack", reference },
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          amountPaid: newTotalPaid,
          depositPaid: true,
          depositPaidAt: booking.depositPaidAt ?? new Date(),
          paystackReference: booking.paystackReference ?? reference,
        },
      });
      commissionEmailData = await recordReferralCommissionIfApplicable(tx, {
        bookingUserId: booking.userId,
        bookingPaymentId: payment.id,
        paidAmountKobo: paidAmount,
      });
    }, { timeout: 15000 });
    // Prisma's default interactive-transaction timeout is 5s — this
    // transaction now does meaningfully more work than when it was first
    // written (referral lookup, tier locking, commission + notification
    // rows), and hit that default under real network latency to the
    // database during testing. A timed-out commit here after Paystack has
    // already charged the client would be a real, dangerous split: money
    // taken, nothing recorded. 15s gives real headroom without masking a
    // genuinely broken query if one ever creeps in.

    if (process.env.BREVO_API_KEY) {
      const receiptHtml = buildReceiptHtml({
        clientName: booking.fullName,
        serviceInterest: booking.serviceInterest,
        reference,
        paidThisTransaction: paidAmount,
        totalPaid: newTotalPaid,
        agreedAmount: booking.agreedAmount,
        paidAt: new Date(),
      });

      const allPayments = await prisma.bookingPayment.findMany({
        where: { bookingId: booking.id },
        orderBy: { createdAt: "asc" },
      });
      const pdfBytes = await generateInvoicePdf({
        id: booking.id,
        fullName: booking.fullName,
        email: booking.email,
        serviceInterest: booking.serviceInterest,
        agreedAmount: booking.agreedAmount,
        amountPaid: newTotalPaid,
        payments: allPayments,
      });
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
      const attachment = [{ name: `receipt-${booking.id}.pdf`, content: pdfBase64 }];

      await Promise.all([
        sendBrevoEmail({
          to: [{ email: booking.email, name: booking.fullName }],
          subject: newTotalPaid >= booking.agreedAmount ? "Paid in full, thank you" : "Payment received",
          htmlContent: receiptHtml,
          attachment,
        }),
        sendBrevoEmail({
          to: [{ email: process.env.STUDIO_NOTIFICATION_EMAIL || "hello@nobsagent.com" }],
          subject: `Payment received: ${booking.fullName}`,
          htmlContent: receiptHtml,
          attachment,
        }),
      ]);

      // A partner-email hiccup shouldn't turn an already-successful payment
      // into an error response, unlike the client/admin receipt emails
      // above which are load-bearing enough to let fail loudly.
      if (commissionEmailData) {
        const data: CommissionEmailData = commissionEmailData;
        sendBrevoEmail({
          to: [{ email: data.partnerEmail, name: data.partnerName }],
          subject: "You earned a referral commission",
          htmlContent: buildCommissionEarnedHtml(data),
        }).catch((err) => console.error("[paystack/verify] commission email failed", err));
      }
    }

    return NextResponse.json({ ok: true, totalPaid: newTotalPaid, agreedAmount: booking.agreedAmount });
  } catch (err) {
    console.error("[paystack/verify] failed", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong verifying payment." },
      { status: 500 }
    );
  }
}
