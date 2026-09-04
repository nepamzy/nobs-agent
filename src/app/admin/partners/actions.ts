"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
  return session;
}

export async function togglePartnerSuspended(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id");
  const suspended = formData.get("suspended") === "true";
  if (typeof id !== "string") throw new Error("Missing partner id.");

  await prisma.referralPartner.update({ where: { id }, data: { suspended: !suspended } });
  revalidatePath("/admin/partners");
  revalidatePath(`/admin/partners/${id}`);
}

const disqualifySchema = z.object({
  referralId: z.string().min(1),
  reason: z.string().trim().min(3, "Give a short reason.").max(500),
});

export async function disqualifyReferral(formData: FormData) {
  await requireAdmin();
  const parsed = disqualifySchema.safeParse({
    referralId: formData.get("referralId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input.");

  const referral = await prisma.referral.update({
    where: { id: parsed.data.referralId },
    data: { status: "DISQUALIFIED", disqualifiedReason: parsed.data.reason },
  });
  revalidatePath(`/admin/partners/${referral.partnerId}`);
}

export async function reinstateReferral(formData: FormData) {
  await requireAdmin();
  const id = formData.get("referralId");
  if (typeof id !== "string") throw new Error("Missing referral id.");

  const referral = await prisma.referral.update({
    where: { id },
    data: { status: "PENDING", disqualifiedReason: null },
  });
  revalidatePath(`/admin/partners/${referral.partnerId}`);
}

export async function markCommissionPaidOut(formData: FormData) {
  await requireAdmin();
  const id = formData.get("commissionId");
  const partnerId = formData.get("partnerId");
  if (typeof id !== "string") throw new Error("Missing commission id.");

  await prisma.referralCommission.update({
    where: { id },
    data: { paidOut: true, paidOutAt: new Date() },
  });
  if (typeof partnerId === "string") revalidatePath(`/admin/partners/${partnerId}`);
}
