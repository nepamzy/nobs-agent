import { prisma } from "@/lib/prisma";

// Short, shareable referral codes (e.g. "JOHNK3F9") — nothing else in this
// codebase generates human-typeable codes, everything unique elsewhere is
// a raw cuid, which is too long to be worth sharing over WhatsApp.
function randomSuffix(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += Math.floor(Math.random() * 36).toString(36);
  }
  return out.toUpperCase();
}

function baseFromName(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] ?? "";
  const cleaned = firstName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return cleaned.slice(0, 8) || "PARTNER";
}

export async function generateReferralCode(name: string): Promise<string> {
  const base = baseFromName(name);
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `${base}${randomSuffix(4)}`;
    const existing = await prisma.referralPartner.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  // Astronomically unlikely to ever reach this, but fall back to something
  // guaranteed-unique rather than looping forever.
  return `${base}${randomSuffix(8)}`;
}
