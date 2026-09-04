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
  transactionId: z.string().min(1),
  bookingId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = rateLimit(`flutterwave-verify:${ip}`, 10, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
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
  const { transactionId, bookingId } = parsed.data;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || !booking.agreedAmount || !booking.depositAmount) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    const existingPayment = await prisma.bookingPayment.findUnique({
      where: { reference: transactionId },
    });
    if (existingPayment) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    // Same rule as Paystack: only Flutterwave's own confirmation of what
    // was actually paid is trusted, never a client-submitted amount.
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const verifyJson = await verifyRes.json();

    if (!verifyRes.ok || verifyJson?.data?.status !== "successful") {
      return NextResponse.json(
        { ok: false, error: "Payment could not be verified." },
        { status: 400 }
      );
    }

    // Flutterwave returns amount in the whole currency unit (naira), not
    // kobo like Paystack, converting here keeps the rest of the app's
    // kobo-everywhere convention intact.
    const paidAmount: number = Math.round(verifyJson.data.amount * 100);
    const currencyOk = verifyJson.data.currency === "NGN";

    if (!currencyOk) {
      return NextResponse.json({ ok: false, error: "Unexpected currency." }, { status: 400 });
    }

    const remainingBefore = booking.agreedAmount - booking.amountPaid;
    const isFirstPayment = booking.amountPaid === 0;

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
        data: { bookingId: booking.id, amount: paidAmount, provider: "flutterwave", reference: transactionId },
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          amountPaid: newTotalPaid,
          depositPaid: true,
          depositPaidAt: booking.depositPaidAt ?? new Date(),
        },
      });
      commissionEmailData = await recordReferralCommissionIfApplicable(tx, {
        bookingUserId: booking.userId,
        bookingPaymentId: payment.id,
        paidAmountKobo: paidAmount,
      });
    }, { timeout: 15000 });
    // See the matching comment in src/app/api/paystack/verify/route.ts —
    // same reasoning, same fix.

    if (process.env.BREVO_API_KEY) {
      const receiptHtml = buildReceiptHtml({
        clientName: booking.fullName,
        serviceInterest: booking.serviceInterest,
        reference: transactionId,
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

      if (commissionEmailData) {
        const data: CommissionEmailData = commissionEmailData;
        sendBrevoEmail({
          to: [{ email: data.partnerEmail, name: data.partnerName }],
          subject: "You earned a referral commission",
          htmlContent: buildCommissionEarnedHtml(data),
        }).catch((err) => console.error("[flutterwave/verify] commission email failed", err));
      }
    }

    return NextResponse.json({ ok: true, totalPaid: newTotalPaid, agreedAmount: booking.agreedAmount });
  } catch (err) {
    console.error("[flutterwave/verify] failed", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong verifying payment." },
      { status: 500 }
    );
  }
}
