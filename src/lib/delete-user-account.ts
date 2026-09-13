import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Not a real row delete — Bookings, Messages, and referral commission
// history all point at this User's id, and several of those relations are
// required (non-nullable), so deleting the row outright would either throw
// on a foreign-key constraint or silently take real payment/commission
// history down with it. Instead: swap the email out (freeing it up for a
// fresh signup with the same address) and invalidate the password, so the
// account is permanently unreachable, while every record that references
// it stays intact. The original email is kept in `originalEmail` so a
// later "link past info" action on a new signup can find this row again.
export async function anonymizeUserAccount(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { referralPartner: { select: { id: true } } },
  });
  if (!user) throw new Error("Account not found.");
  if (user.role === "ADMIN" || user.role === "STAFF") {
    throw new Error("Staff accounts can't be deleted this way.");
  }
  if (user.deletedAt) throw new Error("This account is already deleted.");

  const anonymizedEmail = `deleted+${user.id}@deleted.nobsagent.invalid`;
  const unusablePasswordHash = await bcrypt.hash(crypto.randomUUID(), 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        originalEmail: user.email,
        passwordHash: unusablePasswordHash,
        deletedAt: new Date(),
        suspended: true,
      },
    });

    // A referral partner's own record (referral code, commission history)
    // stays exactly as-is, just suspended — deleting it would break every
    // ReferralCommission row that points at it as the recipient.
    if (user.referralPartner) {
      await tx.referralPartner.update({
        where: { id: user.referralPartner.id },
        data: { suspended: true },
      });
    }
  });

  return { freedEmail: user.email };
}
