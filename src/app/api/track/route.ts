import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const trackSchema = z.object({
  path: z.string().trim().min(1).max(300),
  visitorId: z.string().trim().max(100).optional(),
});

// Common bot/crawler signatures, kept intentionally short, this is a
// courtesy filter to keep the numbers roughly honest, not a security
// measure. A determined bot can still get counted, that's fine, the goal
// is "roughly real visitor counts," not airtight bot detection.
const BOT_PATTERNS = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot/i;

// The IP itself is never stored, only a one-way hash. Preferred input is
// the client-generated visitor ID (stable per browser per day, immune to
// the IP rotation that caused one real visitor to get counted several
// times). IP+UA is kept only as a fallback for the rare case a visitor's
// browser blocks localStorage entirely.
function computeVisitorHash(input: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return createHash("sha256").update(`${input}|${today}`).digest("hex");
}

export async function POST(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") ?? "";
  if (BOT_PATTERNS.test(userAgent)) {
    return NextResponse.json({ ok: true, tracked: false });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  // Generous limit, this just stops one browser tab from spamming the
  // endpoint, not meant to block real traffic.
  const { success: withinLimit } = rateLimit(`track:${ip}`, 30, 60_000);
  if (!withinLimit) {
    return NextResponse.json({ ok: true, tracked: false });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const device = /mobile|android|iphone/i.test(userAgent) ? "mobile" : "desktop";
  const referrer = req.headers.get("referer")?.slice(0, 300) ?? null;
  const dedupInput = parsed.data.visitorId || `${ip}|${userAgent}`;
  const visitorHash = computeVisitorHash(dedupInput);

  try {
    const created = await prisma.pageView.create({
      data: { path: parsed.data.path, device, referrer, visitorHash },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, tracked: true, id: created.id });
  } catch (err) {
    console.error("[track] failed", err);
    return NextResponse.json({ ok: true, tracked: false });
  }
}
