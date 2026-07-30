import { prisma } from "@/lib/prisma";

// Called when either side's inbox loads, marks anything addressed to
// them as delivered, this is the "delivered" tick's actual trigger since
// there's no real-time push to hang it on. Plain function, not a server
// action, deliberately, revalidatePath isn't needed here since the page
// is already rendering with fresh data on this exact request.
export async function markDeliveredForViewer(viewerId: string) {
  try {
    await prisma.message.updateMany({
      where: {
        deliveredAt: null,
        OR: [
          { recipientId: viewerId },
          { recipientId: null, senderId: { not: viewerId } }, // general inbox messages, for admin viewers
        ],
      },
      data: { deliveredAt: new Date() },
    });
  } catch {
    // non-critical
  }
}

export async function markThreadReadForClient(userId: string) {
  try {
    await prisma.message.updateMany({
      where: { recipientId: userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch {
    // non-critical
  }
}

export async function markThreadReadForAdmin(clientUserId: string) {
  try {
    await prisma.message.updateMany({
      where: { senderId: clientUserId, recipientId: null, readAt: null },
      data: { readAt: new Date() },
    });
  } catch {
    // non-critical
  }
}
