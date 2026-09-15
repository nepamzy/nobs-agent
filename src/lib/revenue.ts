import { prisma } from "@/lib/prisma";

// Deliberately its own tiny query, not folded into the analytics page's
// other stats fetches — kept separate so the total revenue figure is only
// ever computed inside the PIN-gated reveal action (src/app/admin/analytics/
// pin-actions.ts), never as part of that page's normal server-rendered load.
export async function getTotalRevenueKobo(): Promise<number> {
  const payments = await prisma.bookingPayment.findMany({ select: { amount: true } });
  return payments.reduce((sum, p) => sum + p.amount, 0);
}
