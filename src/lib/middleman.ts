import { prisma } from "@/lib/prisma";

export const MIDDLEMAN_CAPACITY = 100;

export async function getMiddlemanCount(): Promise<number> {
  try {
    return await prisma.user.count({ where: { role: "MIDDLEMAN" } });
  } catch {
    return 0;
  }
}
