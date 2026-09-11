import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateReferralAgreementPdf } from "@/lib/referral-agreement-pdf";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const partner = await prisma.referralPartner.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "No partner profile found." }, { status: 404 });
  }

  // Same createdAt used at signup time — always shows the real account
  // creation date, not the date it happens to be redownloaded.
  const pdfBytes = await generateReferralAgreementPdf({
    partnerName: partner.user.name,
    partnerEmail: partner.user.email,
    partnerPhone: partner.user.phone ?? "",
    effectiveDate: partner.createdAt,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="NOBS-Agent-Referral-Partner-Agreement.pdf"',
    },
  });
}
