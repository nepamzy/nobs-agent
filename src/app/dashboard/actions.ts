"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Not authorized.");

  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Missing notification id.");

  // Scope the update to the current user, never let a client mark
  // someone else's notification as read via a guessed id.
  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard");
}
