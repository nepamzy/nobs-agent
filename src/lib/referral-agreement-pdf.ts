import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  AGREEMENT_SECTIONS,
  AGREEMENT_INTRO_PARAGRAPHS,
  COMPANY_SIGNATORY_NAME,
  COMPANY_SIGNATORY_TITLE,
} from "@/lib/referral-agreement-content";

// Read once at module load, not per PDF generated — this file never
// changes at runtime, re-reading it from disk on every signup/download
// would be pure waste.
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

// pdf-lib has no built-in text wrapping — this greedily packs words onto
// each line up to the available width, measured against the actual font
// (a fixed character-count wrap would be wrong for a proportional font).
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

export type ReferralAgreementParams = {
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  effectiveDate: Date;
};

export async function generateReferralAgreementPdf(params: ReferralAgreementParams): Promise<Uint8Array> {
  const { partnerName, partnerEmail, partnerPhone, effectiveDate } = params;

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

  cursor.page.drawText("Referral Partner Agreement", { x: LEFT, y: cursor.y, size: 18, font: bold, color: brass });
  cursor.y -= 18;
  cursor.page.drawText("Non-Exclusive Commission-Based Referral Arrangement", {
    x: LEFT,
    y: cursor.y,
    size: 10,
    font,
    color: slate,
  });
  cursor.y -= 30;

  const dateStr = effectiveDate.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const infoLines = [
    `Effective Date: ${dateStr} (the date this account was created on the Company's referral platform)`,
    `Referrer: ${partnerName}`,
    `Email: ${partnerEmail}`,
    `Phone: ${partnerPhone}`,
  ];
  for (const line of infoLines) {
    cursor = drawParagraph(doc, cursor, line, bold, 11, ink, 15);
  }
  cursor.y -= 10;

  for (const p of AGREEMENT_INTRO_PARAGRAPHS) {
    cursor = drawParagraph(doc, cursor, p, font, 10.5);
  }
  cursor.y -= 8;

  for (const section of AGREEMENT_SECTIONS) {
    cursor = ensureSpace(doc, cursor, 30);
    cursor.page.drawText(`${section.number}. ${section.title}`, {
      x: LEFT,
      y: cursor.y,
      size: 12.5,
      font: bold,
      color: ink,
    });
    cursor.y -= 20;

    for (const p of section.paragraphs) {
      cursor = drawParagraph(doc, cursor, p, font, 10);
    }
    cursor.y -= 6;
  }

  // Signature block. Company side carries the real signature image
  // (supplied directly by the account owner) pre-stamped above the Name/
  // Title/Date lines — this document is pre-executed on the Company's
  // side. Referrer side is pre-filled with what's already known, but its
  // signature line is left blank for the Referrer to physically or
  // electronically execute (clause 11.8 permits this).
  const signaturePng = await doc.embedPng(signaturePngBytes);
  const sigWidth = 70;
  const sigHeight = sigWidth * (signaturePng.height / signaturePng.width);

  cursor = ensureSpace(doc, cursor, 230);
  cursor.page.drawLine({
    start: { x: LEFT, y: cursor.y },
    end: { x: RIGHT, y: cursor.y },
    thickness: 1,
    color: brass,
  });
  cursor.y -= 24;

  cursor.page.drawText("For and on behalf of NOBS AGENT", { x: LEFT, y: cursor.y, size: 11, font: bold, color: ink });
  cursor.page.drawText("The Referrer", { x: LEFT + 280, y: cursor.y, size: 11, font: bold, color: ink });
  cursor.y -= 8;

  cursor.page.drawImage(signaturePng, { x: LEFT, y: cursor.y - sigHeight, width: sigWidth, height: sigHeight });
  cursor.y -= sigHeight + 6;

  const sigLines: [string, string][] = [
    [`Name: ${COMPANY_SIGNATORY_NAME}`, "Signature: _____________________"],
    [`Title: ${COMPANY_SIGNATORY_TITLE}`, `Name: ${partnerName}`],
    [`Date: ${dateStr}`, `Date: ${dateStr}`],
  ];
  for (const [companyLine, referrerLine] of sigLines) {
    cursor = ensureSpace(doc, cursor, 18);
    cursor.page.drawText(companyLine, { x: LEFT, y: cursor.y, size: 10, font, color: ink });
    cursor.page.drawText(referrerLine, { x: LEFT + 280, y: cursor.y, size: 10, font, color: ink });
    cursor.y -= 18;
  }

  return doc.save();
}
