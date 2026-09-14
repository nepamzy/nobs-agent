"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// The disabled-until-checked button on the client is a UX nicety, not the
// real gate — this re-checks the box was actually ticked server-side, so
// there's no way to submit this form (dev tools, a raw fetch, anything)
// without it. Nothing is written unless it's genuinely checked.
export async function acknowledgeInactivityPolicy(
  formData: FormData
): Promise<{ error: string } | void> {
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    redirect("/login?callbackUrl=/partner/policy");
  }

  const agreed = formData.get("agreed");
  if (agreed !== "on") {
    return { error: "You must tick the box to continue." };
  }

  const partner = await prisma.referralPartner.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!partner) {
    throw new Error("No partner profile found for this account.");
  }

  await prisma.referralPartner.update({
    where: { id: partner.id },
    data: { inactivityPolicyAckAt: new Date() },
  });

  redirect("/partner");
}
