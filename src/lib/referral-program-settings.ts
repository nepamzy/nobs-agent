import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export type ReferralProgramSettings = {
  partnerCapacity: number;
  multiLevelReferralsEnabled: boolean;
};

const DEFAULTS: ReferralProgramSettings = {
  partnerCapacity: 100,
  multiLevelReferralsEnabled: false,
};

// Falls back to DEFAULTS on any read failure (no row yet, DB hiccup) —
// same "never block a page over a settings read" posture as the rest of
// this codebase's optional-data fetches.
export async function getReferralProgramSettings(): Promise<ReferralProgramSettings> {
  try {
    const row = await prisma.referralProgramSettings.findUnique({ where: { id: SETTINGS_ID } });
    if (!row) return DEFAULTS;
    return { partnerCapacity: row.partnerCapacity, multiLevelReferralsEnabled: row.multiLevelReferralsEnabled };
  } catch {
    return DEFAULTS;
  }
}

export async function updateReferralProgramSettings(
  values: Partial<ReferralProgramSettings>,
  updatedBy: string
): Promise<void> {
  await prisma.referralProgramSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...DEFAULTS, ...values, updatedBy },
    update: { ...values, updatedBy },
  });
}
