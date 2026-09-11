import { NextRequest, NextResponse } from "next/server";
import { checkPartnerActivityForPreviousMonth } from "@/lib/referral-partner-activity";

// Vercel Cron calls this on a schedule (see vercel.json) with
// `Authorization: Bearer ${CRON_SECRET}` automatically attached once
// CRON_SECRET is set in the project's env vars — same guard as
// /api/cron/settle-commissions, since this one suspends accounts.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

// Runs once a month (see vercel.json), just after the month rolls over —
// evaluates the month that just ended for every active partner: 3
// consecutive zero-conversion months auto-suspends and hands the seat to
// the next person on the waitlist, per Agreement clause 7.5.
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const result = await checkPartnerActivityForPreviousMonth();
  return NextResponse.json({ ok: true, ...result });
}
