import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDocument } from "@/components/receipt-document";
import { loadInvoice } from "@/lib/receipt-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function InvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadInvoice(token);
  if (!data) notFound();
  return <InvoiceDocument inv={data} />;
}
