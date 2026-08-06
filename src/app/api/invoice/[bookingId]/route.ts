import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePdf } from "@/lib/invoice-pdf";

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
    include: { payments: { orderBy: { createdAt: "asc" } } },
  });

  if (!booking || !booking.agreedAmount) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // A client can only download their own invoice, admin can download any.
  const isOwner = booking.userId === session.user.id || booking.email === session.user.email;
  const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const pdfBytes = await generateInvoicePdf({ ...booking, agreedAmount: booking.agreedAmount });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${booking.id}.pdf"`,
    },
  });
}
