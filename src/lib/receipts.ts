import QRCode from "qrcode";
import { getSiteUrl } from "@/lib/env";
import { fromMinorUnits } from "@/lib/booking-currencies";

// Receipt and invoice basics shared by the public pages, the PDFs, the
// emails and the admin Payments page.

export const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export const receiptCode = (n: number) => `RCT-${String(n).padStart(6, "0")}`;
export const invoiceCode = (n: number) => `INV-${String(n).padStart(6, "0")}`;

export const receiptUrl = (token: string) => `${getSiteUrl()}/receipt/${token}`;
export const invoiceUrl = (token: string) => `${getSiteUrl()}/invoice/${token}`;

// Amounts are stored in minor units (kobo for NGN). Printed with the ISO code
// ("NGN 120,000.00") rather than a symbol: the PDF's built-in font can't draw
// symbols like the naira sign, and the code reads the same everywhere.
export function money(minor: number, currency: string): string {
  const major = fromMinorUnits(minor, currency);
  return `${currency} ${major.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function paymentMethodLabel(provider: string): string {
  if (provider === "paystack") return "Card / bank via Paystack";
  if (provider === "flutterwave") return "Flutterwave";
  if (provider === "manual") return "Confirmed by NOBS AGENT";
  return provider;
}

export function qrPng(url: string, width = 360): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: "png",
    width,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0d12", light: "#ffffff" },
  });
}
