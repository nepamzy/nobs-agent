import { NextResponse } from "next/server";
import { loadReceipt } from "@/lib/receipt-data";
import { receiptUrl, qrPng } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await loadReceipt(token);
  if (!found) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const png = await qrPng(receiptUrl(found.token), 480);
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
