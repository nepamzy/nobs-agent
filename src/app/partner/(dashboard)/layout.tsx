import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { InstallButton } from "@/components/install-button";
import { PushSubscribeButton } from "@/components/push-subscribe-button";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already gates /partner to REFERRER, this is defense in
  // depth matching the same pattern used in src/app/admin/layout.tsx.
  const session = await auth();
  if (!session || session.user.role !== "REFERRER") {
    redirect("/login?callbackUrl=/partner");
  }

  // The real, un-bypassable gate for the 3-consecutive-inactive-month
  // policy acknowledgment: this layout wraps every page under /partner's
  // (dashboard) route group, so no dashboard content ever renders for an
  // account that hasn't ticked the box on /partner/policy yet — fresh
  // signup, waitlist promotion, a direct URL, an old bookmark, all of it.
  const partner = await prisma.referralPartner.findUnique({
    where: { userId: session.user.id },
    select: { inactivityPolicyAckAt: true },
  });
  if (partner && !partner.inactivityPolicyAckAt) {
    redirect("/partner/policy");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-medium">
            {session.user.name ? session.user.name.split(" ")[0] : "Partner"}
          </p>
          <p className="text-xs text-[var(--color-slate)]">{session.user.email}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <InstallButton />
          <PushSubscribeButton className="flex items-center gap-2 text-sm text-[var(--color-slate)] transition hover:text-[var(--color-brass)]" />
          <SignOutButton />
        </div>
      </div>
      {children}
    </div>
  );
}
