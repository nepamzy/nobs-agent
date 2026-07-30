import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Mail, Calendar, Video, DollarSign } from "lucide-react";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let booking;
  try {
    booking = await prisma.booking.findUnique({ where: { id }, include: { payments: true } });
  } catch {
    booking = null;
  }

  if (!booking) notFound();

  return (
    <div>
      <Link
        href="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to bookings
      </Link>

      <div className="glass mt-4 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-medium">
              {booking.fullName}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <Mail size={12} /> {booking.email}
            </p>
          </div>
          <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--color-slate)]">
            {booking.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-[var(--color-slate)]">Service interest</p>
            <p className="mt-1 text-sm">{booking.serviceInterest}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-slate)]">Budget range</p>
            <p className="mt-1 text-sm">{booking.budgetRange}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <Video size={12} /> Meeting type
            </p>
            <p className="mt-1 text-sm">{booking.meetingType}</p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <Calendar size={12} /> Preferred time
            </p>
            <p className="mt-1 text-sm">{new Date(booking.scheduledFor).toLocaleString()}</p>
          </div>
        </div>

        {booking.notes && (
          <div className="mt-6">
            <p className="mb-2 text-xs text-[var(--color-slate)]">Brief</p>
            <div className="rounded-lg bg-white/5 p-4 text-sm leading-relaxed">{booking.notes}</div>
          </div>
        )}

        {booking.agreedAmount && (
          <div className="mt-6 border-t border-[var(--color-line)] pt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <DollarSign size={12} /> Payment
            </p>
            <p className="text-sm">
              {formatNaira(booking.amountPaid)} of {formatNaira(booking.agreedAmount)} paid
            </p>
            {booking.payments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {booking.payments.map((p: { id: string; createdAt: Date; provider: string; amount: number }) => (
                  <li key={p.id} className="text-xs text-[var(--color-slate)]">
                    {new Date(p.createdAt).toLocaleDateString()}, {p.provider}, {formatNaira(p.amount)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p className="mt-6 text-xs text-[var(--color-slate)]">
          Submitted {new Date(booking.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
