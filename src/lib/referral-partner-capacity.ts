import { prisma } from "@/lib/prisma";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";

// Admin-editable now (see /admin/partners) — this function is the only
// place that should be called for the current cap, never a hardcoded
// number, so raising it from the admin panel takes effect everywhere at
// once with no code change.
export async function getReferralPartnerCapacity(): Promise<number> {
  const { partnerCapacity } = await getReferralProgramSettings();
  return partnerCapacity;
}

export async function getReferralPartnerCount(): Promise<number> {
  try {
    return await prisma.user.count({ where: { role: "REFERRER" } });
  } catch {
    return 0;
  }
}
