import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PartnerSignupForm } from "@/components/partner-signup-form";
import { getReferralPartnerCapacity, getReferralPartnerCount } from "@/lib/referral-partner-capacity";
import { getReferralPartnerWaitlistCount } from "@/lib/referral-partner-waitlist";
import { getReferralProgramSettings } from "@/lib/referral-program-settings";
import { prisma } from "@/lib/prisma";

// The full/not-full state depends on a live DB count, so this page must
// never be served from the static prerender cache built at deploy time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Become a referral partner",
  robots: { index: false },
  alternates: {
    canonical: "/partner/signup",
  },
};

// Existence + suspension in one lookup: a code that doesn't match any
// partner at all is treated the same as a suspended one below — neither
// counts as a valid, active referral link that should bypass the
// direct-signup gate.
async function getRefPartnerStatus(ref: string | undefined): Promise<{ exists: boolean; suspended: boolean }> {
  if (!ref) return { exists: false, suspended: false };
  try {
    const partner = await prisma.referralPartner.findUnique({
      where: { referralCode: ref },
      select: { suspended: true },
    });
    if (!partner) return { exists: false, suspended: false };
    return { exists: true, suspended: partner.suspended };
  } catch {
    return { exists: false, suspended: false };
  }
}

export default async function PartnerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const [count, capacity, refStatus, waitlistCount, settings] = await Promise.all([
    getReferralPartnerCount(),
    getReferralPartnerCapacity(),
    getRefPartnerStatus(ref),
    getReferralPartnerWaitlistCount(),
    getReferralProgramSettings(),
  ]);
  const isFull = count >= capacity;
  const linkSuspended = refStatus.exists && refStatus.suspended;
  // A real, active partner's own link always works, no matter how old
  // their account is or whether direct signup is currently closed.
  const hasValidRefLink = refStatus.exists && !refStatus.suspended;
  const directSignupOpen = settings.directPartnerSignupEnabled || hasValidRefLink;

  if (!directSignupOpen) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
        <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
        <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
          Referral Partner Program
        </p>
        <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
          Become a referral partner
        </h1>
        <div className="glass mt-4 rounded-2xl p-8 text-center">
          <p className="font-medium">Not open for direct signup right now</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            New referral partners join through an existing partner&apos;s personal referral link.
            If someone referred you here, ask them for their link. Otherwise, check back later or
            reach out to us directly.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-24">
      <Image src="/logo-mark.svg" alt="" width={56} height={56} className="mx-auto mb-6" />
      <p className="mb-3 text-center font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Referral Partner Program
      </p>
      <h1 className="mb-2 text-center font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        Become a referral partner
      </h1>
      <p className="mb-8 text-center text-sm text-[var(--color-slate)]">
        Get your own referral link, earn commission on every paying client you bring, and unlock a
        higher rate after your 10th successful referral.
      </p>
      {linkSuspended && (
        <div className="glass mb-6 rounded-2xl p-8 text-center">
          <p className="font-medium text-red-400">Account Suspended</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            This referral link is no longer active. You can still sign up below without it.
          </p>
        </div>
      )}

      {isFull && (
        <div className="glass mb-6 rounded-2xl p-6 text-center">
          <p className="font-medium text-[var(--color-brass)]">All {capacity} spots are taken right now</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            Sign up below to join the waitlist — you&apos;d be number {waitlistCount + 1} in line.
            The moment a spot opens up, it goes to whoever&apos;s been waiting longest, automatically.
          </p>
        </div>
      )}

      <PartnerSignupForm recruiterCode={ref} />
    </div>
  );
}
