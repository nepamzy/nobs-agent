import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { rateLimit } from "@/lib/rate-limit";
import { buildReceiptHtml } from "@/lib/receipt";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { recordReferralCommissionIfApplicable, type CommissionEmailData } from "@/lib/referral-commission";
import { buildCommissionEarnedHtml, buildOverrideCommissionEarnedHtml } from "@/lib/partner-email";
import { getExchangeRates, convertAmount } from "@/lib/exchange-rates";
import { toMinorUnits } from "@/lib/booking-currencies";

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
    if (!booking) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    // NGN books off agreedAmount/depositAmount/amountPaid, exactly as
    // Paystack does. Every other currency books off the international*
    // equivalents — the REAL price and running total in that currency,
    // set directly by an admin (see ../../../admin/bookings/actions.ts),
    // never derived from the Naira figures. See the comment on
    // Booking.currency in schema.prisma.
    const isNgn = booking.currency === "NGN";
    const totalAgreed = isNgn ? booking.agreedAmount : booking.internationalAgreedAmount;
    const depositFloor = isNgn ? booking.depositAmount : booking.internationalDepositAmount;
    const alreadyPaid = isNgn ? booking.amountPaid : booking.internationalAmountPaid;
    if (!totalAgreed || !depositFloor) {
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

    // Only ever trust what Flutterwave itself confirms was charged, in
    // whatever currency the booking was set up for — never a
    // client-submitted amount or currency, and never assume it matches
    // what /pay/[id] displayed a moment earlier.
    if (verifyJson.data.currency !== booking.currency) {
      return NextResponse.json({ ok: false, error: "Unexpected currency." }, { status: 400 });
    }

    // The amount actually credited: real NGN kobo for an NGN booking, or
    // the booking's own currency's minor units otherwise — this is what
    // agreedAmount/internationalAgreedAmount are already denominated in,
    // no FX conversion involved.
    const paidAmount = isNgn
      ? Math.round(verifyJson.data.amount * 100)
      : toMinorUnits(verifyJson.data.amount, booking.currency);

    const remainingBefore = totalAgreed - alreadyPaid;
    const isFirstPayment = alreadyPaid === 0;

    if (isFirstPayment && paidAmount < depositFloor) {
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

    const newTotalPaid = alreadyPaid + paidAmount;

    // Referral commissions are always computed in NGN (partner payouts are
    // NGN-native) — for a non-NGN booking this converts what was actually
    // paid into its NGN-kobo equivalent purely for that internal
    // bookkeeping, never shown to the client and never what they were
    // charged.
    let paidAmountKoboForCommission = paidAmount;
    if (!isNgn) {
      const { rates } = await getExchangeRates();
      const ngnMajor = convertAmount(verifyJson.data.amount, booking.currency, "NGN", rates);
      paidAmountKoboForCommission = Math.round(ngnMajor * 100);
    }

    let commissionEmails: CommissionEmailData[] = [];
    await prisma.$transaction(async (tx) => {
      const payment = await tx.bookingPayment.create({
        data: { bookingId: booking.id, amount: paidAmount, provider: "flutterwave", reference: transactionId },
      });
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          ...(isNgn ? { amountPaid: newTotalPaid } : { internationalAmountPaid: newTotalPaid }),
          depositPaid: true,
          depositPaidAt: booking.depositPaidAt ?? new Date(),
        },
      });
      commissionEmails = await recordReferralCommissionIfApplicable(tx, {
        bookingUserId: booking.userId,
        bookingPaymentId: payment.id,
        paidAmountKobo: paidAmountKoboForCommission,
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
        agreedAmount: totalAgreed,
        paidAt: new Date(),
        currency: booking.currency,
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
        agreedAmount: totalAgreed,
        amountPaid: newTotalPaid,
        payments: allPayments,
        currency: booking.currency,
      });
      const pdfBase64 = Buffer.from(pdfBytes).toString("base64");
      const attachment = [{ name: `receipt-${booking.id}.pdf`, content: pdfBase64 }];

      await Promise.all([
        sendBrevoEmail({
          to: [{ email: booking.email, name: booking.fullName }],
          subject: newTotalPaid >= totalAgreed ? "Paid in full, thank you" : "Payment received",
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

      for (const data of commissionEmails) {
        const send =
          data.kind === "base"
            ? sendBrevoEmail({
                to: [{ email: data.partnerEmail, name: data.partnerName }],
                subject: "You earned a referral commission",
                htmlContent: buildCommissionEarnedHtml(data),
              })
            : sendBrevoEmail({
                to: [{ email: data.partnerEmail, name: data.partnerName }],
                subject: "You earned an override commission",
                htmlContent: buildOverrideCommissionEarnedHtml(data),
              });
        send.catch((err) => console.error("[flutterwave/verify] commission email failed", err));
      }
    }

    return NextResponse.json({ ok: true, totalPaid: newTotalPaid, agreedAmount: totalAgreed });
  } catch (err) {
    console.error("[flutterwave/verify] failed", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong verifying payment." },
      { status: 500 }
    );
  }
}
