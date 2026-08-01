import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const durationSchema = z.object({
  id: z.string().trim().min(1).max(50),
  durationMs: z.number().int().min(0).max(60 * 60 * 1000),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    const raw = await req.text();
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = durationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await prisma.pageView.update({
      where: { id: parsed.data.id },
      data: { durationMs: parsed.data.durationMs },
    });
  } catch {
    // Row may not exist or was already updated, non-critical beacon.
  }

  return NextResponse.json({ ok: true });
}
