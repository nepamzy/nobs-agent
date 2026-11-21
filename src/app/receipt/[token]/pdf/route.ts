import { NextResponse } from "next/server";
import { loadReceipt } from "@/lib/receipt-data";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import { receiptCode } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const receipt = await loadReceipt(token);
  if (!receipt) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const bytes = await generateReceiptPdf(receipt);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${receiptCode(receipt.number)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
