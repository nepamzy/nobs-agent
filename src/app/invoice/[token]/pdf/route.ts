import { NextResponse } from "next/server";
import { loadInvoice } from "@/lib/receipt-data";
import { generateInvoicePdf } from "@/lib/receipt-pdf";
import { invoiceCode } from "@/lib/receipts";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await loadInvoice(token);
  if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const bytes = await generateInvoicePdf(invoice);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoiceCode(invoice.number)}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
