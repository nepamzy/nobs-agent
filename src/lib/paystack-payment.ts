import { prisma } from "@/lib/prisma";
import { sendBrevoEmail } from "@/lib/brevo";
import { buildReceiptHtml } from "@/lib/receipt";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { recordReferralCommissionIfApplicable, type CommissionEmailData } from "@/lib/referral-commission";
import { buildCommissionEarnedHtml, buildOverrideCommissionEarnedHtml } from "@/lib/partner-email";
import { isUniqueConstraintError } from "@/lib/prisma-errors";

// Records one Paystack payment against a booking. Shared by the two ways a
// payment can reach us:
//   - src/app/api/paystack/verify/route.ts: the client's browser, after
//     Paystack redirects it back to /pay/[bookingId]
//   - src/app/api/paystack/webhook/route.ts: Paystack's own server-to-
//     server notification, which still arrives if the client closed the tab
//     before the redirect finished
// Whichever arrives second finds the payment already recorded (the
// BookingPayment.reference unique constraint) and does nothing, so a
// payment is never counted twice and the receipt emails go out once.

export type RecordPaymentResult =
  | { ok: true; alreadyPaid: true }
  | { ok: true; alreadyPaid: false; totalPaid: number; agreedAmount: number }
  | { ok: false; status: number; error: string };

export async function recordPaystackPayment({
  reference,
  bookingId,
  secretKey,
}: {
  reference: string;
  bookingId: string;
  secretKey: string;
}): Promise<RecordPaymentResult> {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || !booking.agreedAmount || !booking.depositAmount) {
    return { ok: false, status: 404, error: "Booking not found." };
  }

  // Idempotency: if this exact transaction was already recorded (the
  // browser retried after a network blip, or the webhook got here first),
  // don't double-count it.
  const existingPayment = await prisma.bookingPayment.findUnique({ where: { reference } });
  if (existingPayment) {
    return { ok: true, alreadyPaid: true };
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
    return { ok: false, status: 400, error: "Payment could not be verified." };
  }

  // src/app/api/paystack/initialize/route.ts tags every transaction with
  // the booking it was started for. A reference paid for one booking must
  // never be applied to another.
  const paidForBookingId = verifyJson.data.metadata?.bookingId;
  if (paidForBookingId && paidForBookingId !== booking.id) {
    return { ok: false, status: 400, error: "Payment does not belong to this booking." };
  }

  const paidAmount: number = verifyJson.data.amount;
  const remainingBefore = booking.agreedAmount - booking.amountPaid;
  const isFirstPayment = booking.amountPaid === 0;

  // Business rule enforcement, even though the checkout UI already tries
  // to prevent these, the server is the actual authority.
  if (isFirstPayment && paidAmount < booking.depositAmount) {
    return { ok: false, status: 400, error: "First payment must meet the minimum deposit." };
  }
  if (paidAmount > remainingBefore) {
    return { ok: false, status: 400, error: "Payment exceeds the remaining balance." };
  }

  const newTotalPaid = booking.amountPaid + paidAmount;

  let commissionEmails: CommissionEmailData[] = [];
  try {
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
      commissionEmails = await recordReferralCommissionIfApplicable(tx, {
        bookingUserId: booking.userId,
        bookingPaymentId: payment.id,
        paidAmountKobo: paidAmount,
      });
    }, { timeout: 15000 });
  } catch (err) {
    // The browser verify and the webhook can arrive at the same moment and
    // both pass the findUnique check above. The reference's unique
    // constraint lets exactly one of them commit; the other lands here.
    if (isUniqueConstraintError(err)) {
      return { ok: true, alreadyPaid: true };
    }
    throw err;
  }
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
    // above which are load-bearing enough to let fail loudly. Zero, one,
    // or two of these — the referral's own partner and, separately,
    // their recruiter (the override) — whichever have no subaccount to
    // wait on (see recordReferralCommissionIfApplicable).
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
      send.catch((err) => console.error("[paystack] commission email failed", err));
    }
  }

  return { ok: true, alreadyPaid: false, totalPaid: newTotalPaid, agreedAmount: booking.agreedAmount };
}
