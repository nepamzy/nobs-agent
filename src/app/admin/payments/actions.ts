"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function clearAllPaymentData() {
  const session = await auth();
  // ADMIN only, not STAFF, this wipes every payment figure across the
  // whole site and can't be undone, deliberately the highest bar this
  // app has for any single action.
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }

  await prisma.$transaction([
    prisma.bookingPayment.deleteMany({}),
    prisma.booking.updateMany({
      data: { amountPaid: 0, depositPaid: false, depositPaidAt: null },
    }),
  ]);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/clients");
  revalidatePath("/dashboard/payments");
}
