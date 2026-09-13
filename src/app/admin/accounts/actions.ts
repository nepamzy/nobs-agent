"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anonymizeUserAccount } from "@/lib/delete-user-account";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    throw new Error("Not authorized.");
  }
}

function safeRedirectTarget(raw: FormDataEntryValue | null): string {
  // Only ever used to bounce back to one of these two admin lists, never a
  // client-controlled arbitrary path.
  return raw === "/admin/partners" ? "/admin/partners" : "/admin/clients";
}

export async function deleteUserAccount(formData: FormData) {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string") throw new Error("Missing account id.");
  const redirectTo = safeRedirectTarget(formData.get("redirectTo"));

  await anonymizeUserAccount(userId);

  revalidatePath("/admin/clients");
  revalidatePath("/admin/partners");
  redirect(redirectTo);
}

// Re-attaches a deleted account's Bookings (and, if it's not already
// spoken for, its Client marketing record) to a NEW account belonging to
// the same real person — found by the phone number or original email they
// used before. Never touches ReferralPartner history (referral code,
// commission continuity) — merging two partner identities has real payout
// implications that need a deliberate, separate decision, not an
// auto-merge here.
export async function linkPastAccount(formData: FormData) {
  await requireAdmin();
  const newUserId = formData.get("newUserId");
  const lookupRaw = formData.get("lookup");
  const redirectTo = safeRedirectTarget(formData.get("redirectTo"));

  if (typeof newUserId !== "string" || typeof lookupRaw !== "string" || !lookupRaw.trim()) {
    throw new Error("Enter the phone number or email their old account used.");
  }
  const lookup = lookupRaw.trim();

  const oldUser = await prisma.user.findFirst({
    where: {
      deletedAt: { not: null },
      OR: [{ originalEmail: lookup }, { phone: lookup }],
    },
    include: { client: true },
  });
  if (!oldUser) throw new Error("No deleted account found matching that phone number or email.");
  if (oldUser.id === newUserId) throw new Error("That's already this account.");

  await prisma.$transaction(async (tx) => {
    await tx.booking.updateMany({ where: { userId: oldUser.id }, data: { userId: newUserId } });

    if (oldUser.client) {
      const newUserAlreadyHasClient = await tx.client.findUnique({ where: { userId: newUserId } });
      // Only re-link if the new account has no Client record of its own —
      // never silently merge two live Client rows into one.
      if (!newUserAlreadyHasClient) {
        await tx.client.update({ where: { id: oldUser.client.id }, data: { userId: newUserId } });
      }
    }
  });

  revalidatePath("/admin/clients");
  revalidatePath("/admin/partners");
  redirect(redirectTo);
}
