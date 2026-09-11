import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { COMPANY_SIGNATORY_NAME, COMPANY_SIGNATORY_TITLE } from "@/lib/referral-agreement-content";

// Same signature asset as the Referral Partner Agreement (see
// src/lib/referral-agreement-pdf.ts) — one real signature image, reused
// everywhere a document needs the Company side pre-executed.
const SIGNATURE_PNG_PATH = path.join(process.cwd(), "src/assets/signature-nobert-agu.png");
const signaturePngBytes = fs.readFileSync(SIGNATURE_PNG_PATH);

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842; // A4
const LEFT = 50;
const RIGHT = 545;
const TOP = 792;
const BOTTOM_MARGIN = 60;
const CONTENT_WIDTH = RIGHT - LEFT;

const brass = rgb(0.647, 0.51, 0.161);
const ink = rgb(0.05, 0.05, 0.07);
const slate = rgb(0.4, 0.4, 0.44);

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

type Cursor = { page: PDFPage; y: number };

function newPage(doc: PDFDocument): PDFPage {
  return doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

function ensureSpace(doc: PDFDocument, cursor: Cursor, neededHeight: number): Cursor {
  if (cursor.y - neededHeight < BOTTOM_MARGIN) {
    return { page: newPage(doc), y: TOP };
  }
  return cursor;
}

function drawParagraph(
  doc: PDFDocument,
  cursor: Cursor,
  text: string,
  font: PDFFont,
  size: number,
  color = ink,
  lineGap = 13
): Cursor {
  const lines = wrapText(text, font, size, CONTENT_WIDTH);
  let { page, y } = cursor;
  for (const line of lines) {
    ({ page, y } = ensureSpace(doc, { page, y }, lineGap));
    page.drawText(line, { x: LEFT, y, size, font, color });
    y -= lineGap;
  }
  return { page, y: y - 4 };
}

function formatNaira(kobo: number): string {
  return `NGN ${(kobo / 100).toLocaleString("en-NG")}`;
}

export type ClientAgreementParams = {
  bookingId: string;
  clientName: string;
  clientEmail: string;
  serviceInterest: string;
  meetingType: string;
  scheduledFor: Date;
  agreedAmount: number; // kobo
  depositPercentage: number;
  depositAmount: number; // kobo
  confirmedAt: Date;
  // Null on bookings made before Terms & Conditions tracking was added —
  // the document says so instead of printing a blank.
  termsAcceptedAt: Date | null;
  termsAcceptedIp: string | null;
  // Set only when this client was referred by a partner, so the partner's
  // dashboard can show this same document under the client's name.
  referredByPartnerName?: string | null;
};

// Generates the short-form Client Service Agreement live from a CONFIRMED
// booking's real data — nothing here is a fillable blank, so nothing here
// can be hand-edited after the fact. Mirrors the "sealed" pattern of
// src/lib/referral-agreement-pdf.ts: the Company side (signature included)
// is pre-executed at generation time, only the Client's line is left blank.
export async function generateClientAgreementPdf(params: ClientAgreementParams): Promise<Uint8Array> {
  const {
    bookingId,
    clientName,
    clientEmail,
    serviceInterest,
    meetingType,
    scheduledFor,
    agreedAmount,
    depositPercentage,
    depositAmount,
    confirmedAt,
    termsAcceptedAt,
    termsAcceptedIp,
    referredByPartnerName,
  } = params;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let cursor: Cursor = { page: newPage(doc), y: TOP };

  cursor.page.drawText("NOBS AGENT", { x: LEFT, y: cursor.y, size: 20, font: bold, color: ink });
  cursor.y -= 16;
  cursor.page.drawText("Kaduna, Nigeria, remote-first, nobsagent0@gmail.com", {
    x: LEFT,
    y: cursor.y,
    size: 9,
    font,
    color: slate,
  });
  cursor.y -= 34;

  cursor.page.drawText("Client Service Agreement", { x: LEFT, y: cursor.y, size: 18, font: bold, color: brass });
  cursor.y -= 18;
  cursor.page.drawText("Short form — generated automatically from a confirmed booking", {
    x: LEFT,
    y: cursor.y,
    size: 10,
    font,
    color: slate,
  });
  cursor.y -= 30;

  const confirmedDateStr = confirmedAt.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const scheduledStr = scheduledFor.toLocaleString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const infoLines = [
    `Booking Reference: ${bookingId}`,
    `Date Confirmed: ${confirmedDateStr}`,
    `Client Name: ${clientName}`,
    `Client Email: ${clientEmail}`,
    `Service / Package: ${serviceInterest}`,
    `Meeting Type: ${meetingType}`,
    `Scheduled For: ${scheduledStr}`,
    `Total Project Fee: ${formatNaira(agreedAmount)}`,
  ];
  for (const line of infoLines) {
    cursor = drawParagraph(doc, cursor, line, bold, 11, ink, 15);
  }
  cursor.y -= 6;

  cursor = drawParagraph(
    doc,
    cursor,
    'This Client Service Agreement ("Agreement") confirms the terms of the project above, agreed between NOBS AGENT and the Client named above, and incorporates by reference the Terms and Conditions (nobs-agent.site/terms) accepted by the Client at the time of booking.',
    font,
    10
  );
  cursor.y -= 6;

  cursor = ensureSpace(doc, cursor, 24);
  cursor.page.drawText("Payment Schedule", { x: LEFT, y: cursor.y, size: 12.5, font: bold, color: ink });
  cursor.y -= 20;

  const balance = agreedAmount - depositAmount;
  const paymentRows = [
    [`Deposit — at project commencement (${depositPercentage}%)`, formatNaira(depositAmount)],
    ["Balance — across development completion and final delivery (standard 35% / 20% split, unless otherwise agreed)", formatNaira(balance)],
  ];
  for (const [label, amount] of paymentRows) {
    const before = cursor.y;
    cursor = drawParagraph(doc, cursor, label, font, 10, ink, 13);
    cursor.page.drawText(amount, { x: RIGHT - 110, y: before, size: 10, font: bold, color: brass });
    cursor.y -= 4;
  }
  cursor.y -= 6;

  cursor = drawParagraph(
    doc,
    cursor,
    "Included with this project: two rounds of revisions, and 30 days of post-launch bug fixing from the date of final delivery, both as set out in the Terms and Conditions.",
    font,
    10
  );

  const termsLine = termsAcceptedAt
    ? `Terms accepted: ${termsAcceptedAt.toLocaleString("en-NG")} — IP: ${termsAcceptedIp ?? "not recorded"}.`
    : "Terms accepted at time of booking (recorded prior to formal Terms and Conditions tracking).";
  cursor = drawParagraph(doc, cursor, termsLine, font, 9, slate, 12);

  if (referredByPartnerName) {
    cursor = drawParagraph(doc, cursor, `Referred by: ${referredByPartnerName} (Referral Partner).`, font, 9, slate, 12);
  }

  // Signature block — Company side pre-executed, same as the Referral
  // Partner Agreement, Client side left blank for them to sign.
  const signaturePng = await doc.embedPng(signaturePngBytes);
  const sigWidth = 70;
  const sigHeight = sigWidth * (signaturePng.height / signaturePng.width);

  cursor = ensureSpace(doc, cursor, 190);
  cursor.page.drawLine({
    start: { x: LEFT, y: cursor.y },
    end: { x: RIGHT, y: cursor.y },
    thickness: 1,
    color: brass,
  });
  cursor.y -= 24;

  cursor.page.drawText("For and on behalf of NOBS AGENT", { x: LEFT, y: cursor.y, size: 11, font: bold, color: ink });
  cursor.page.drawText("The Client", { x: LEFT + 280, y: cursor.y, size: 11, font: bold, color: ink });
  cursor.y -= 8;

  cursor.page.drawImage(signaturePng, { x: LEFT, y: cursor.y - sigHeight, width: sigWidth, height: sigHeight });
  cursor.y -= sigHeight + 6;

  const sigLines: [string, string][] = [
    [`Name: ${COMPANY_SIGNATORY_NAME}`, "Signature: _____________________"],
    [`Title: ${COMPANY_SIGNATORY_TITLE}`, `Name: ${clientName}`],
    [`Date: ${confirmedDateStr}`, `Date: ${confirmedDateStr}`],
  ];
  for (const [companyLine, clientLine] of sigLines) {
    cursor = ensureSpace(doc, cursor, 18);
    cursor.page.drawText(companyLine, { x: LEFT, y: cursor.y, size: 10, font, color: ink });
    cursor.page.drawText(clientLine, { x: LEFT + 280, y: cursor.y, size: 10, font, color: ink });
    cursor.y -= 18;
  }

  cursor.y -= 10;
  cursor = drawParagraph(
    doc,
    cursor,
    `This document was generated automatically from confirmed booking ${bookingId} on ${confirmedDateStr} and reflects exactly the price and terms agreed at that time. It is not an editable template — regenerating it always reproduces the same values from the booking record.`,
    font,
    8,
    slate,
    11
  );

  return doc.save();
}
