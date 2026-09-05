import { prisma } from "@/lib/prisma";

export const REFERRAL_PARTNER_CAPACITY = 100;

export async function getReferralPartnerCount(): Promise<number> {
  try {
    return await prisma.user.count({ where: { role: "REFERRER" } });
  } catch {
    return 0;
  }
}
