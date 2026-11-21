import { getSiteUrl } from "@/lib/env";
import { loadReceiptByReference } from "@/lib/receipt-data";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import { receiptCode, receiptUrl } from "@/lib/receipts";

// Everything a payment email needs about the receipt that was just created:
// its number, the public link and QR image, and the PDF to attach. Returns
// null (never throws) so a receipt problem can never turn a recorded payment
// into a failed one.
export async function prepareReceiptDelivery(reference: string) {
  try {
    const view = await loadReceiptByReference(reference);
    if (!view) return null;
    const pdf = await generateReceiptPdf(view);
    const code = receiptCode(view.number);
    return {
      code,
      url: receiptUrl(view.token),
      qrUrl: `${getSiteUrl()}/receipt/${view.token}/qr`,
      attachment: [{ name: `${code}.pdf`, content: Buffer.from(pdf).toString("base64") }],
    };
  } catch (err) {
    console.error("[receipt] could not prepare the receipt for", reference, err);
    return null;
  }
}
