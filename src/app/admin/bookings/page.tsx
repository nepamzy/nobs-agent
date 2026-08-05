import { prisma } from "@/lib/prisma";
import { updateBookingStatus, confirmBookingWithDeposit } from "./actions";
import { BookingSearchList } from "@/components/admin/booking-search-list";

type BookingRow = Awaited<ReturnType<typeof prisma.booking.findMany>>[number];

async function getBookings() {
  try {
    const rows = await prisma.booking.findMany({ orderBy: { scheduledFor: "asc" }, take: 50 });
    return { rows, connected: true };
  } catch {
    return { rows: [] as BookingRow[], connected: false };
  }
}

export default async function AdminBookingsPage() {
  const { rows, connected } = await getBookings();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Bookings
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Consultation requests from the booking form. Confirming with a price emails the
        client a deposit payment link automatically.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, bookings will appear here once{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> is live.
        </div>
      )}

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">No booking requests yet.</p>
      )}

      <BookingSearchList
        rows={rows}
        confirmBookingWithDeposit={confirmBookingWithDeposit}
        updateBookingStatus={updateBookingStatus}
      />
    </div>
  );
}
