"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { authorizeBookingPayment, confirmBookingWithDeposit } from "@/app/admin/bookings/actions";

export async function clearAllPaymentData() {
  const session = await auth();
  // ADMIN only, not STAFF, this wipes every payment figure across the
  // whole site and can't be undone, deliberately the highest bar this
  // app has for any single action.
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }

  await prisma.$transaction([
    // Referral commissions reference BookingPayment rows, so they have to
    // go first — otherwise deleting the payments they point to would hit
    // a foreign-key wall.
    prisma.referralCommission.deleteMany({}),
    prisma.bookingPayment.deleteMany({}),
    prisma.booking.updateMany({
      data: {
        amountPaid: 0,
        depositPaid: false,
        depositPaidAt: null,
        // Clearing the agreed price too, not just what's paid, is what
        // actually makes the number disappear rather than reappear as
        // "outstanding." A confirmed booking with no price reverts to
        // pending, the same state it was in before it was ever priced.
        agreedAmount: null,
        depositPercentage: null,
        depositAmount: null,
        status: "PENDING",
      },
    }),
    // Wiping payments would otherwise leave referrals permanently
    // "converted" at a locked-in rate with no actual payment behind it,
    // and partners' tier progress stuck at whatever it was — reset both
    // back to their pre-payment state along with everything else here.
    prisma.referral.updateMany({
      data: {
        status: "PENDING",
        commissionRatePercent: null,
        tierPositionAtQualification: null,
        convertedAt: null,
      },
    }),
    prisma.referralPartner.updateMany({ data: { paidReferralCount: 0 } }),
  ]);

  revalidatePath("/admin/payments");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/clients");
  revalidatePath("/dashboard/payments");
  revalidatePath("/admin/partners");
  revalidatePath("/partner");
}

// ---------- Forms on the Payments page ----------
// Each returns { ok, message } or { error } instead of throwing, so a wrong
// number shows up as a message on the card instead of a crash page.

export type PaymentFormState = { ok: true; message: string } | { ok: false; error: string } | undefined;

async function requireStaff() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

function fail(err: unknown, fallback: string): PaymentFormState {
  return { ok: false, error: err instanceof Error ? err.message : fallback };
}

export async function approvePaymentAction(_prev: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  try {
    await requireStaff();
    const amount = Number(formData.get("amountNaira"));
    if (!Number.isFinite(amount) || amount <= 0) {
      return { ok: false, error: "Enter the amount received, greater than zero." };
    }
    const form = new FormData();
    form.set("id", String(formData.get("id") ?? ""));
    form.set("mode", "amount");
    form.set("value", String(amount));
    const price = String(formData.get("agreedAmountNaira") ?? "").trim();
    if (price) form.set("agreedAmountNaira", price);
    form.set("note", String(formData.get("note") ?? ""));
    await authorizeBookingPayment(form);
    return { ok: true, message: "Payment approved. The receipt is ready below and the client has been emailed." };
  } catch (err) {
    return fail(err, "Could not approve that payment.");
  }
}

export async function setPriceAction(_prev: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  try {
    await requireStaff();
    const price = Number(formData.get("agreedAmountNaira"));
    if (!Number.isFinite(price) || price <= 0) return { ok: false, error: "Enter the agreed price, greater than zero." };
    const form = new FormData();
    form.set("id", String(formData.get("id") ?? ""));
    form.set("agreedAmountNaira", String(price));
    form.set("depositPercentage", String(formData.get("depositPercentage") || 45));
    await confirmBookingWithDeposit(form);
    revalidatePath("/admin/payments");
    return { ok: true, message: "Price saved and the client has been sent the payment link." };
  } catch (err) {
    return fail(err, "Could not save that price.");
  }
}

export async function linkClientAction(_prev: PaymentFormState, formData: FormData): Promise<PaymentFormState> {
  try {
    await requireStaff();
    const id = String(formData.get("id") ?? "");
    const clientId = String(formData.get("clientId") ?? "");
    if (!id) return { ok: false, error: "Missing booking." };

    if (!clientId) {
      await prisma.booking.update({ where: { id }, data: { clientId: null } });
    } else {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) return { ok: false, error: "That client no longer exists." };
      // If the client has an account, link it too so the booking, its
      // invoice and receipts show up in their own dashboard.
      await prisma.booking.update({
        where: { id },
        data: { clientId: client.id, ...(client.userId ? { userId: client.userId } : {}) },
      });
    }
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/clients");
    revalidatePath("/dashboard/payments");
    return { ok: true, message: clientId ? "Booking linked to the client." : "Booking unlinked." };
  } catch (err) {
    return fail(err, "Could not link that booking.");
  }
}
