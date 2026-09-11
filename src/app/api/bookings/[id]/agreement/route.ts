import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateClientAgreementPdf } from "@/lib/client-agreement-pdf";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { id } = await params;

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // The whole point: this document only exists once the price is real and
  // locked in, never before. No CONFIRMED status/agreed price, no document
  // — nothing here for anyone to generate early or hand-edit.
  if (booking.status !== "CONFIRMED" || !booking.agreedAmount || !booking.depositAmount || booking.depositPercentage == null || !booking.confirmedAt) {
    return NextResponse.json(
      { error: "This agreement isn't available until the booking is confirmed with a price." },
      { status: 409 }
    );
  }

  // A referral, if any, tying this booking's client to a partner — needed
  // both for the authorization check below and to credit the partner by
  // name on the document itself.
  const referral = booking.userId
    ? await prisma.referral.findUnique({
        where: { referredUserId: booking.userId },
        include: { partner: { include: { user: true } } },
      })
    : null;

  const isOwner = booking.userId === session.user.id || booking.email === session.user.email;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  const isReferringPartner = referral?.partner.userId === session.user.id;

  if (!isOwner && !isStaff && !isReferringPartner) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const pdfBytes = await generateClientAgreementPdf({
    bookingId: booking.id,
    clientName: booking.fullName,
    clientEmail: booking.email,
    serviceInterest: booking.serviceInterest,
    meetingType: booking.meetingType,
    scheduledFor: booking.scheduledFor,
    agreedAmount: booking.agreedAmount,
    depositPercentage: booking.depositPercentage,
    depositAmount: booking.depositAmount,
    confirmedAt: booking.confirmedAt,
    termsAcceptedAt: booking.termsAcceptedAt,
    termsAcceptedIp: booking.termsAcceptedIp,
    referredByPartnerName: referral?.partner.user.name ?? null,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="client-agreement-${booking.id}.pdf"`,
    },
  });
}
