import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordPaystackPayment } from "@/lib/paystack-payment";

// Paystack's server-to-server payment notification. The browser redirect
// back to /pay/[bookingId] (src/app/api/paystack/verify/route.ts) is the
// normal path, but it never fires if the client closes the tab or loses
// signal right after paying. This webhook records the payment anyway.
// Set its URL (https://www.nobs-agent.site/api/paystack/webhook) in the
// Paystack dashboard under Settings → API Keys & Webhooks.

// Paystack signs each webhook with the account's secret key:
// x-paystack-signature = hex HMAC-SHA512 of the raw request body.
function hasValidPaystackSignature(rawBody: string, header: string | null, secretKey: string): boolean {
  if (!header) return false;
  const expected = createHmac("sha512", secretKey).update(rawBody, "utf8").digest();
  const received = Buffer.from(header, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[paystack/webhook] Missing PAYSTACK_SECRET_KEY");
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const rawBody = await req.text();
  if (!hasValidPaystackSignature(rawBody, req.headers.get("x-paystack-signature"), secretKey)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Only successful charges matter here. Everything else (transfers,
  // refunds, subscription events) is acknowledged so Paystack stops
  // resending it.
  if (event?.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  const reference: unknown = event.data?.reference;
  const bookingId: unknown = event.data?.metadata?.bookingId;
  if (typeof reference !== "string" || typeof bookingId !== "string") {
    // Not a booking checkout (no bookingId tag from initialize/route.ts),
    // nothing for this site to record.
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await recordPaystackPayment({ reference, bookingId, secretKey });
    if (!result.ok) {
      // Money was taken but a business rule rejected recording it (e.g.
      // below the deposit). Retrying won't change that, so acknowledge,
      // and log it for a manual look in the admin bookings page.
      console.error("[paystack/webhook] payment not recorded", { reference, bookingId, error: result.error });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    // A real failure (database down, Paystack API unreachable). A non-2xx
    // makes Paystack retry later, which is safe: recordPaystackPayment
    // skips a reference that's already been recorded.
    console.error("[paystack/webhook] failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
