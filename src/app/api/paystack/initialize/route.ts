import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/env";
import { computeCheckoutSplitPlan } from "@/lib/referral-split";
import { MIN_INSTALLMENT_KOBO } from "@/lib/payment-constants";

const initializeSchema = z.object({
  bookingId: z.string().min(1),
  amountKobo: z.number().int().positive(),
});

// Server-initiated Paystack checkout, replacing the old client-side Inline
// JS popup + single `subaccount` param — that mechanism can only express
// ONE fixed recipient share (baked into the subaccount at creation time),
// which can't represent a two-tier split (main + recruiter override) or a
// bonus-tier rate that differs from a partner's normal rate. Paystack's
// dynamic `split` object, only available through this REST endpoint (not
// Inline JS), can. See src/lib/referral-split.ts for how the split is
// decided, and DEPLOYMENT.md-adjacent notes: this changes checkout from an
// on-page popup to a redirect to Paystack's own hosted page and back.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success: withinLimit } = rateLimit(`paystack-initialize:${ip}`, 10, 60_000);
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

  const parsed = initializeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { bookingId, amountKobo } = parsed.data;

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || !booking.agreedAmount || !booking.depositAmount) {
      return NextResponse.json({ ok: false, error: "Booking not found." }, { status: 404 });
    }

    const remaining = booking.agreedAmount - booking.amountPaid;
    if (remaining <= 0) {
      return NextResponse.json({ ok: false, error: "This booking is already paid in full." }, { status: 400 });
    }

    const isFirstPayment = booking.amountPaid === 0;
    const minimumForThisPayment = isFirstPayment
      ? booking.depositAmount
      : Math.min(MIN_INSTALLMENT_KOBO, remaining);

    if (amountKobo < minimumForThisPayment) {
      return NextResponse.json(
        { ok: false, error: `This payment must be at least ₦${(minimumForThisPayment / 100).toLocaleString("en-NG")}.` },
        { status: 400 }
      );
    }
    if (amountKobo > remaining) {
      return NextResponse.json(
        { ok: false, error: `This payment can't exceed the remaining balance of ₦${(remaining / 100).toLocaleString("en-NG")}.` },
        { status: 400 }
      );
    }

    const splitPlan = await computeCheckoutSplitPlan(booking.userId);
    const reference = `nobs-${bookingId}-${Date.now()}`;

    const initBody: Record<string, unknown> = {
      email: booking.email,
      amount: amountKobo,
      reference,
      currency: "NGN",
      callback_url: `${getSiteUrl()}/pay/${bookingId}?verify=${reference}`,
      metadata: { bookingId },
    };
    if (splitPlan.kind === "single") {
      initBody.subaccount = splitPlan.subaccountCode;
    } else if (splitPlan.kind === "dual") {
      initBody.split = {
        type: "percentage",
        currency: "NGN",
        bearer_type: "account",
        subaccounts: [
          { subaccount: splitPlan.mainCode, share: splitPlan.mainShare },
          { subaccount: splitPlan.overrideCode, share: splitPlan.overrideShare },
        ],
      };
    }

    const initRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(initBody),
    });
    const initJson = await initRes.json();

    if (!initRes.ok || !initJson?.status || !initJson?.data?.authorization_url) {
      console.error("[paystack/initialize] Paystack rejected the request", initJson);
      return NextResponse.json(
        { ok: false, error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, authorizationUrl: initJson.data.authorization_url, reference });
  } catch (err) {
    console.error("[paystack/initialize] failed", err);
    return NextResponse.json({ ok: false, error: "Something went wrong starting checkout." }, { status: 500 });
  }
}
