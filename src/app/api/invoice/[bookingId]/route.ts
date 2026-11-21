import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Older links (client dashboard, saved emails) point here. Signed-in owners
// and staff are sent on to the invoice PDF, which is the branded NOBS AGENT
// invoice with a QR code.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { bookingId } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { invoiceToken: true, userId: true, email: true },
  });
  if (!booking) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isOwner = booking.userId === session.user.id || booking.email === session.user.email;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  return NextResponse.redirect(new URL(`/invoice/${booking.invoiceToken}/pdf`, req.url));
}
