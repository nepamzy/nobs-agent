import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

// Case-insensitive on entry — normalized to uppercase before validating,
// hashing, or comparing, so "a1b2" and "A1B2" are the same PIN.
export function normalizePin(raw: string): string {
  return raw.trim().toUpperCase();
}

// Exactly 4 characters: exactly 2 letters and exactly 2 digits. The order
// is deliberately not fixed here — whatever arrangement the admin picks
// when they set it (e.g. "A1B2", "12AB", "1A2B") is valid, as long as the
// mix is right.
export function isValidPinFormat(pin: string): boolean {
  if (pin.length !== 4) return false;
  const letters = pin.match(/[A-Z]/g)?.length ?? 0;
  const digits = pin.match(/[0-9]/g)?.length ?? 0;
  return letters === 2 && digits === 2;
}

export async function isRevenuePinSet(): Promise<boolean> {
  try {
    const row = await prisma.adminSettings.findUnique({
      where: { id: SETTINGS_ID },
      select: { revenuePinHash: true },
    });
    return Boolean(row?.revenuePinHash);
  } catch {
    return false;
  }
}

export async function setRevenuePin(pin: string, updatedBy: string): Promise<void> {
  const normalized = normalizePin(pin);
  if (!isValidPinFormat(normalized)) {
    throw new Error("PIN must be exactly 4 characters: 2 letters and 2 digits.");
  }
  const hash = await bcrypt.hash(normalized, 12);
  await prisma.adminSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, revenuePinHash: hash, updatedBy },
    update: { revenuePinHash: hash, updatedBy },
  });
}

export async function verifyRevenuePin(pin: string): Promise<boolean> {
  const row = await prisma.adminSettings.findUnique({
    where: { id: SETTINGS_ID },
    select: { revenuePinHash: true },
  });
  if (!row?.revenuePinHash) return false;
  return bcrypt.compare(normalizePin(pin), row.revenuePinHash);
}
