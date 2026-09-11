import { NextRequest, NextResponse } from "next/server";
import { checkAndSendBookingNudges } from "@/lib/referral-partner-booking-nudge";

// Vercel Cron calls this on a schedule (see vercel.json) with
// `Authorization: Bearer ${CRON_SECRET}` automatically attached once
// CRON_SECRET is set in the project's env vars — same guard as the other
// cron routes.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Runs daily (see vercel.json). Each partner is only actually evaluated
// once every 14 days, anchored to their own signup date — see
// checkAndSendBookingNudges for why this runs daily rather than on a
// shared bi-weekly schedule.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const result = await checkAndSendBookingNudges();
  return NextResponse.json({ ok: true, ...result });
}
