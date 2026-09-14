import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PartnerPolicyForm } from "@/components/partner-policy-form";

export const metadata: Metadata = {
  title: "Your seat — inactivity policy",
  robots: { index: false },
};

export default async function PartnerPolicyPage() {
  // Same role gate as every other /partner route (see middleware.ts) —
  // this is defense in depth, matching the pattern used elsewhere.
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    redirect("/login?callbackUrl=/partner/policy");
  }

  const partner = await prisma.referralPartner.findUnique({
    where: { userId: session.user.id },
    select: { inactivityPolicyAckAt: true },
  });

  // Already acknowledged (or came here after promotion from the waitlist,
  // whatever the path) — nothing left to do here, straight to the dashboard.
  if (partner?.inactivityPolicyAckAt) {
    redirect("/partner");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Before you continue
      </p>
      <h1 className="mb-6 text-center font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight">
        Your seat — how it stays active
      </h1>

      <div className="glass mb-6 rounded-2xl p-6 text-sm leading-relaxed text-[var(--color-paper)]">
        <p className="mb-3">
          This seat stays active as long as you&apos;re bringing in referrals. If you go{" "}
          <strong>two full calendar months with no paying referral</strong>, we&apos;ll send you a
          heads-up that your seat has one month left.
        </p>
        <p className="mb-3">
          If a <strong>third consecutive month</strong> passes with still no paying referral, your
          seat is automatically given up to the next person waiting in line — no warning beyond
          that first one, it just happens.
        </p>
        <p className="mb-3">
          The good news: it only takes <strong>one paying referral</strong> in any given month to
          reset the count back to zero, so this only ever becomes a problem if you go quiet for
          three months straight.
        </p>
        <p>Any commission you&apos;ve already earned by that point is untouched either way.</p>
      </div>

      <PartnerPolicyForm />
    </div>
  );
}
