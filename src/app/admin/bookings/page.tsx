import { prisma } from "@/lib/prisma";
import { updateBookingStatus, confirmBookingWithDeposit, confirmInternationalBookingWithDeposit, deleteBooking } from "./actions";
import { BookingSearchList } from "@/components/admin/booking-search-list";
import { AddBookingForm } from "@/components/admin/add-booking-form";
import { getExchangeRates, convertAmount } from "@/lib/exchange-rates";
import { internationalFloorPrices } from "@/lib/data/pricing-international";

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

  // For a PENDING non-NGN booking, prefill the confirm form with the
  // package's researched international floor price
  // (src/lib/data/pricing-international.ts) converted into that specific
  // booking's currency — the starting point an admin can then override
  // (bargained up or down). No floor exists for every service (e.g.
  // recurring items like SEO/Website Maintenance), those just get no
  // default and the admin enters a number directly, same as today.
  const needsRates = rows.some((r) => r.status === "PENDING" && r.currency !== "NGN");
  const rates = needsRates ? (await getExchangeRates()).rates : null;

  const rowsWithHints = rows.map((row) => {
    if (row.status !== "PENDING" || row.currency === "NGN" || !rates) {
      return { ...row, internationalFloorHint: null as number | null };
    }
    const floorUsd = internationalFloorPrices[row.serviceInterest];
    if (floorUsd === undefined) return { ...row, internationalFloorHint: null as number | null };
    return { ...row, internationalFloorHint: convertAmount(floorUsd, "USD", row.currency, rates) };
  });

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

      {connected && <AddBookingForm />}

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">No booking requests yet.</p>
      )}

      <BookingSearchList
        rows={rowsWithHints}
        confirmBookingWithDeposit={confirmBookingWithDeposit}
        confirmInternationalBookingWithDeposit={confirmInternationalBookingWithDeposit}
        updateBookingStatus={updateBookingStatus}
        deleteBooking={deleteBooking}
      />
    </div>
  );
}
