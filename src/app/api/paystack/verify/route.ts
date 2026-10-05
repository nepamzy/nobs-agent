import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { recordPaystackPayment } from "@/lib/paystack-payment";

// Called by the client's browser after Paystack redirects it back to
// /pay/[bookingId]. The actual recording logic is shared with the
// Paystack webhook, see src/lib/paystack-payment.ts.

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
    const result = await recordPaystackPayment({ reference, bookingId, secretKey });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    if (result.alreadyPaid) {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }
    return NextResponse.json({ ok: true, totalPaid: result.totalPaid, agreedAmount: result.agreedAmount });
  } catch (err) {
    console.error("[paystack/verify] failed", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong verifying payment." },
      { status: 500 }
    );
  }
}
