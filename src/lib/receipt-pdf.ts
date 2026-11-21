import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { logoPng } from "@/lib/brand-logo";
import type { InvoiceView, ReceiptView } from "@/lib/receipt-data";
import {
  invoiceCode,
  invoiceUrl,
  money,
  paymentMethodLabel,
  qrPng,
  receiptCode,
  receiptUrl,
} from "@/lib/receipts";

// Branded NOBS AGENT receipt and invoice PDFs. Built with the PDF standard
// fonts, which can only draw basic Latin letters, so every piece of text goes
// through pdfSafe() first: a client called "Ọlá" or a project note with an
// emoji must never be able to crash the download.

const INK = rgb(0.043, 0.051, 0.071);
const BRASS = rgb(0.894, 0.702, 0.263);
const BRASS_DIM = rgb(0.647, 0.51, 0.184);
const SLATE = rgb(0.42, 0.44, 0.5);
const PAPER = rgb(0.965, 0.961, 0.945);
const WHITE = rgb(1, 1, 1);
const GREEN = rgb(0.06, 0.55, 0.38);
const LINE = rgb(0.88, 0.86, 0.8);

const LEFT = 40;
const RIGHT = 555;

export function pdfSafe(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

type Ctx = { doc: PDFDocument; page: PDFPage; font: PDFFont; bold: PDFFont; mono: PDFFont; logo: Awaited<ReturnType<PDFDocument["embedPng"]>> };

function text(c: Ctx, s: string, x: number, y: number, size: number, opts: { bold?: boolean; mono?: boolean; color?: ReturnType<typeof rgb>; right?: boolean } = {}) {
  const font = opts.mono ? c.mono : opts.bold ? c.bold : c.font;
  const safe = pdfSafe(s);
  const px = opts.right ? x - font.widthOfTextAtSize(safe, size) : x;
  c.page.drawText(safe, { x: px, y, size, font, color: opts.color ?? INK });
}

function label(c: Ctx, s: string, x: number, y: number) {
  text(c, s.toUpperCase(), x, y, 7.5, { bold: true, color: SLATE });
}

async function startDocument(kind: string, code: string): Promise<Ctx> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);
  const logo = await doc.embedPng(await logoPng());
  const c: Ctx = { doc, page, font, bold, mono, logo };
  drawHeader(c, kind, code);
  return c;
}

function drawHeader(c: Ctx, kind: string, code: string) {
  c.page.drawRectangle({ x: 0, y: 742, width: 595, height: 100, color: INK });
  c.page.drawRectangle({ x: 0, y: 739, width: 595, height: 3, color: BRASS });
  c.page.drawImage(c.logo, { x: LEFT, y: 762, width: 56, height: 56 });
  text(c, "NOBS AGENT", 108, 796, 21, { bold: true, color: WHITE });
  text(c, "REAL SYSTEMS, NOT TEMPLATES.", 108, 779, 8, { bold: true, color: BRASS });
  text(c, kind.toUpperCase(), RIGHT, 796, 12, { bold: true, color: BRASS, right: true });
  text(c, code, RIGHT, 776, 17, { bold: true, color: WHITE, right: true });
}

async function drawQr(c: Ctx, url: string, y: number, caption: string) {
  const png = await c.doc.embedPng(await qrPng(url, 420));
  c.page.drawRectangle({ x: LEFT - 6, y: y - 6, width: 122, height: 122, color: WHITE, borderColor: LINE, borderWidth: 1 });
  c.page.drawImage(png, { x: LEFT, y, width: 110, height: 110 });
  text(c, caption, LEFT + 130, y + 88, 11, { bold: true });
  text(c, "Scan the code, or open the link below, to see this", LEFT + 130, y + 70, 8.5, { color: SLATE });
  text(c, "document online. It always shows the real record.", LEFT + 130, y + 58, 8.5, { color: SLATE });
  const short = url.replace(/^https?:\/\//, "");
  for (let i = 0, line = 0; i < short.length; i += 48, line++) {
    text(c, short.slice(i, i + 48), LEFT + 130, y + 36 - line * 10, 7.5, { mono: true, color: BRASS_DIM });
  }
}

function drawFooter(c: Ctx) {
  c.page.drawLine({ start: { x: LEFT, y: 52 }, end: { x: RIGHT, y: 52 }, thickness: 0.6, color: LINE });
  text(c, "NOBS AGENT  |  Kaduna, Nigeria, remote-first  |  nobsagent0@gmail.com  |  www.nobs-agent.site", LEFT, 38, 8, { color: SLATE });
}

function chip(c: Ctx, s: string, right: number, y: number, color: ReturnType<typeof rgb>) {
  const w = c.bold.widthOfTextAtSize(s, 8.5) + 20;
  c.page.drawRectangle({ x: right - w, y, width: w, height: 20, color, borderWidth: 0 });
  text(c, s, right - w + 10, y + 6.5, 8.5, { bold: true, color: WHITE });
}

function row(c: Ctx, k: string, v: string, y: number, strong = false, color = INK) {
  text(c, k, LEFT, y, 10.5, { color: SLATE });
  text(c, v, RIGHT, y, 10.5, { bold: strong, color, right: true });
  c.page.drawLine({ start: { x: LEFT, y: y - 8 }, end: { x: RIGHT, y: y - 8 }, thickness: 0.4, color: LINE });
}

export async function generateReceiptPdf(r: ReceiptView): Promise<Uint8Array> {
  const c = await startDocument("Payment receipt", receiptCode(r.number));
  let y = 700;

  label(c, "Received from", LEFT, y);
  text(c, r.clientName, LEFT, y - 16, 13, { bold: true });
  label(c, "For", LEFT, y - 44);
  text(c, r.service, LEFT, y - 60, 11);

  label(c, "Date", 360, y);
  text(c, r.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), 360, y - 16, 11);
  label(c, "Payment method", 360, y - 44);
  text(c, paymentMethodLabel(r.method), 360, y - 60, 10);
  label(c, "Reference", 360, y - 84);
  text(c, r.reference.length > 30 ? `${r.reference.slice(0, 27)}...` : r.reference, 360, y - 98, 8.5, { mono: true });

  y -= 140;
  c.page.drawRectangle({ x: LEFT, y: y - 62, width: RIGHT - LEFT, height: 72, color: PAPER, borderColor: BRASS, borderWidth: 1.2 });
  label(c, "Amount received", LEFT + 16, y - 6);
  text(c, money(r.amount, r.currency), LEFT + 16, y - 40, 26, { bold: true });
  const paidInFull = r.balance === 0 && r.agreedTotal > 0;
  chip(c, paidInFull ? "PAID IN FULL" : "PART PAYMENT", RIGHT - 16, y - 34, paidInFull ? GREEN : BRASS_DIM);

  y -= 100;
  row(c, "Agreed project total", money(r.agreedTotal, r.currency), y);
  row(c, "Paid before this payment", money(r.paidBefore, r.currency), y - 26);
  row(c, "This payment", money(r.amount, r.currency), y - 52, true);
  row(c, "Total paid to date", money(r.paidAfter, r.currency), y - 78);
  row(c, "Balance remaining", paidInFull ? "Paid in full" : money(r.balance, r.currency), y - 104, true, paidInFull ? GREEN : INK);

  await drawQr(c, receiptUrl(r.token), 110, "Verify this receipt");
  text(c, "Thank you for your business.", RIGHT, 250, 10, { bold: true, color: BRASS_DIM, right: true });
  drawFooter(c);
  return c.doc.save();
}

export async function generateInvoicePdf(inv: InvoiceView): Promise<Uint8Array> {
  const c = await startDocument("Invoice", invoiceCode(inv.number));
  let y = 700;

  label(c, "Billed to", LEFT, y);
  text(c, inv.clientName, LEFT, y - 16, 13, { bold: true });
  text(c, inv.email, LEFT, y - 32, 9.5, { color: SLATE });
  label(c, "Project", LEFT, y - 58);
  text(c, inv.service, LEFT, y - 74, 11);

  label(c, "Date issued", 360, y);
  text(c, inv.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), 360, y - 16, 11);
  const paidInFull = inv.balance === 0 && inv.agreedTotal > 0;
  chip(c, paidInFull ? "PAID IN FULL" : inv.paid > 0 ? "PART PAID" : "UNPAID", RIGHT, y - 60, paidInFull ? GREEN : inv.paid > 0 ? BRASS_DIM : SLATE);

  y -= 120;
  text(c, "Payments received", LEFT, y, 12, { bold: true });
  y -= 20;
  c.page.drawRectangle({ x: LEFT, y: y - 6, width: RIGHT - LEFT, height: 20, color: PAPER });
  label(c, "Receipt", LEFT + 8, y);
  label(c, "Date", LEFT + 110, y);
  label(c, "Method", LEFT + 200, y);
  text(c, "AMOUNT", RIGHT - 8, y, 7.5, { bold: true, color: SLATE, right: true });
  y -= 24;

  const shown = inv.payments.slice(0, 14);
  if (shown.length === 0) {
    text(c, "No payments recorded yet.", LEFT + 8, y, 10, { color: SLATE });
    y -= 20;
  }
  for (const p of shown) {
    text(c, receiptCode(p.number), LEFT + 8, y, 9.5, { mono: true });
    text(c, p.date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }), LEFT + 110, y, 9.5);
    text(c, paymentMethodLabel(p.method), LEFT + 200, y, 9.5);
    text(c, money(p.amount, inv.currency), RIGHT - 8, y, 9.5, { bold: true, right: true });
    y -= 20;
  }
  if (inv.payments.length > shown.length) {
    text(c, `+ ${inv.payments.length - shown.length} more payments, see the invoice online.`, LEFT + 8, y, 8.5, { color: SLATE });
    y -= 20;
  }

  y -= 14;
  row(c, "Project total", money(inv.agreedTotal, inv.currency), y);
  row(c, "Paid to date", money(inv.paid, inv.currency), y - 26);
  row(c, "Balance due", paidInFull ? "Paid in full" : money(inv.balance, inv.currency), y - 52, true, paidInFull ? GREEN : INK);

  await drawQr(c, invoiceUrl(inv.token), 110, "View this invoice online");
  drawFooter(c);
  return c.doc.save();
}
