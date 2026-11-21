import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptDocument } from "@/components/receipt-document";
import { loadReceipt } from "@/lib/receipt-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await loadReceipt(token);
  if (!data) notFound();
  return <ReceiptDocument r={data} />;
}
