import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AuthorizePaymentForm } from "./authorize-payment-form";
import { DeleteBookingButton } from "./delete-booking-button";
import { removeBookingPayment } from "../actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { BookingFileUpload } from "@/components/booking-file-upload";
import { toDownloadUrl } from "@/lib/cloudinary-download";
import { formatMajorAmount, fromMinorUnits } from "@/lib/booking-currencies";
import { ArrowLeft, Mail, Phone, Calendar, Video, DollarSign } from "lucide-react";

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
    booking = await prisma.booking.findUnique({
      where: { id },
      include: { payments: true, files: { orderBy: { createdAt: "desc" } }, user: true },
    });
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
            {booking.user?.phone && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
                <Phone size={12} /> {booking.user.phone}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {booking.currency !== "NGN" && (
              <span
                className="rounded-full border border-[var(--color-brass)]/50 px-3 py-1 text-xs uppercase tracking-wider text-[var(--color-brass)]"
                title="This client pays via Flutterwave in their own currency. The agreed price and deposit are set directly in that currency below, not converted from Naira."
              >
                Pays in {booking.currency}
              </span>
            )}
            <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-wider text-[var(--color-slate)]">
              {booking.status}
            </span>
            <DeleteBookingButton bookingId={booking.id} />
          </div>
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

        <div className="mt-6">
          <p className="mb-2 text-xs text-[var(--color-slate)]">Attachments</p>
          {booking.files.length > 0 ? (
            <ul className="mb-3 space-y-1.5">
              {booking.files.map((f: { id: string; url: string; fileName: string; uploadedByRole: string }) => (
                <li key={f.id} className="flex items-center gap-2">
                  <a
                    href={toDownloadUrl(f.url, f.fileName)}
                    className="text-sm text-[var(--color-brass)] underline underline-offset-4"
                  >
                    {f.fileName}
                  </a>
                  <span className="text-[10px] text-[var(--color-slate)]">
                    {f.uploadedByRole === "CLIENT" ? "client" : "you"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-sm text-[var(--color-slate)]">No files attached yet.</p>
          )}
          <BookingFileUpload bookingId={booking.id} />
        </div>

        {booking.currency === "NGN" && booking.agreedAmount && (
          <div className="mt-6 border-t border-[var(--color-line)] pt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <DollarSign size={12} /> Payment
            </p>
            <p className="text-sm">
              {formatNaira(booking.amountPaid)} of {formatNaira(booking.agreedAmount)} paid
            </p>
            {booking.payments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {booking.payments.map(
                  (p: {
                    id: string;
                    createdAt: Date;
                    provider: string;
                    amount: number;
                    note: string | null;
                  }) => (
                    <li key={p.id} className="text-xs text-[var(--color-slate)]">
                      {new Date(p.createdAt).toLocaleDateString()}, {p.provider}, {formatNaira(p.amount)}
                      {p.provider === "manual" && (
                        <span className="ml-1 rounded-full border border-[var(--color-brass)]/40 px-1.5 py-0.5 text-[10px] uppercase text-[var(--color-brass)]">
                          Admin override
                        </span>
                      )}
                      {p.note && <span className="block italic">&ldquo;{p.note}&rdquo;</span>}
                    </li>
                  )
                )}
              </ul>
            )}

            {booking.amountPaid > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <form action={removeBookingPayment}>
                  <input type="hidden" name="id" value={booking.id} />
                  <input type="hidden" name="mode" value="reset" />
                  <ConfirmSubmit
                    message="Reset this booking's payment to zero? The agreed price stays, it just shows as unpaid again. This can't be undone."
                    className="rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
                  >
                    Reset payment to zero
                  </ConfirmSubmit>
                </form>
                <form action={removeBookingPayment}>
                  <input type="hidden" name="id" value={booking.id} />
                  <input type="hidden" name="mode" value="remove" />
                  <ConfirmSubmit
                    message="Remove this payment entirely? This also clears the agreed price and puts the booking back to pending, as if it had never been priced. This can't be undone."
                    className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Remove payment entirely
                  </ConfirmSubmit>
                </form>
              </div>
            )}
          </div>
        )}

        {booking.currency !== "NGN" && booking.internationalAgreedAmount && (
          <div className="mt-6 border-t border-[var(--color-line)] pt-6">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <DollarSign size={12} /> Payment
            </p>
            <p className="text-sm">
              {formatMajorAmount(fromMinorUnits(booking.internationalAmountPaid, booking.currency), booking.currency)}{" "}
              of {formatMajorAmount(fromMinorUnits(booking.internationalAgreedAmount, booking.currency), booking.currency)} paid
            </p>
            {booking.payments.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {booking.payments.map(
                  (p: { id: string; createdAt: Date; provider: string; amount: number; note: string | null }) => (
                    <li key={p.id} className="text-xs text-[var(--color-slate)]">
                      {new Date(p.createdAt).toLocaleDateString()}, {p.provider},{" "}
                      {formatMajorAmount(fromMinorUnits(p.amount, booking.currency), booking.currency)}
                      {p.note && <span className="block italic">&ldquo;{p.note}&rdquo;</span>}
                    </li>
                  )
                )}
              </ul>
            )}
            <p className="mt-3 text-xs text-[var(--color-slate)]">
              Resetting or removing a payment isn&apos;t available yet for non-Naira bookings.
            </p>
          </div>
        )}

        {booking.currency === "NGN" && (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <AuthorizePaymentForm
            bookingId={booking.id}
            hasAgreedAmount={!!booking.agreedAmount}
            priorStatus={booking.status}
            agreedAmount={booking.agreedAmount}
            amountPaid={booking.amountPaid}
          />
        )}
        {booking.currency !== "NGN" && (booking.status === "PENDING" || booking.status === "CONFIRMED") && (
          <p className="mt-6 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-slate)]">
            Manually authorizing a payment (for one received outside Flutterwave) isn&apos;t available yet
            for non-Naira bookings — confirm the price from the Bookings list, then let the client pay
            through the link.
          </p>
        )}

        <p className="mt-6 text-xs text-[var(--color-slate)]">
          Submitted {new Date(booking.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
