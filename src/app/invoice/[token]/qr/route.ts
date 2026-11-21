import { NextResponse } from "next/server";
import { loadInvoice } from "@/lib/receipt-data";
import { invoiceUrl, qrPng } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await loadInvoice(token);
  if (!found) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const png = await qrPng(invoiceUrl(found.token), 480);
  return new NextResponse(new Uint8Array(png), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
  });
}
