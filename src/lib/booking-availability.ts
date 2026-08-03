import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@prisma/client";

const ONE_HOUR_MS = 60 * 60 * 1000;
export const MAX_BOOKINGS_PER_DAY = 8;

// A booking still "holds" its slot until it's explicitly rejected or
// cancelled, PENDING and CONFIRMED both count against the day's cap and
// against 1-hour conflicts.
const ACTIVE_STATUSES: BookingStatus[] = ["PENDING", "CONFIRMED"];
function formatTime(d: Date) {
  return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

export async function checkBookingAvailability(
  scheduledFor: Date
): Promise<{ ok: true } | { ok: false; error: string }> {
  const dayStart = new Date(scheduledFor);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const sameDayBookings = await prisma.booking.findMany({
    where: {
      scheduledFor: { gte: dayStart, lt: dayEnd },
      status: { in: ACTIVE_STATUSES },
    },
    select: { id: true, scheduledFor: true, fullName: true, email: true },
  });

  if (sameDayBookings.length >= MAX_BOOKINGS_PER_DAY) {
    return {
      ok: false,
      error: `This date is fully booked (a maximum of ${MAX_BOOKINGS_PER_DAY} consultations per day). Please choose a different date.`,
    };
  }

  const conflict = sameDayBookings.find(
    (b) => Math.abs(new Date(b.scheduledFor).getTime() - scheduledFor.getTime()) < ONE_HOUR_MS
  );

  if (conflict) {
    // Prefer showing the conflicting customer's business/organization name
    // over their personal name, falling back to whatever they gave.
    let label = conflict.fullName;
    try {
      const client = await prisma.client.findFirst({
        where: { user: { email: conflict.email } },
        select: { name: true, organization: true },
      });
      if (client) label = client.organization || client.name || label;
    } catch {
      // fall back to fullName above
    }

    const slotStart = new Date(conflict.scheduledFor);
    const slotEnd = new Date(slotStart.getTime() + ONE_HOUR_MS);

    return {
      ok: false,
      error: `That time is taken, ${label} has ${formatTime(slotStart)}–${formatTime(
        slotEnd
      )}. Please pick another available time, or a different date.`,
    };
  }

  return { ok: true };
}
