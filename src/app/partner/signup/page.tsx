import type { Metadata } from "next";
import Image from "next/image";
import { PartnerSignupForm } from "@/components/partner-signup-form";
import { REFERRAL_PARTNER_CAPACITY, getReferralPartnerCount } from "@/lib/referral-partner-capacity";

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

export default async function PartnerSignupPage() {
  const count = await getReferralPartnerCount();
  const isFull = count >= REFERRAL_PARTNER_CAPACITY;

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
      {isFull ? (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="font-medium text-red-400">Not available</p>
          <p className="mt-2 text-sm text-[var(--color-slate)]">
            All {REFERRAL_PARTNER_CAPACITY} referral partner spots are taken right now. Check back later.
          </p>
        </div>
      ) : (
        <PartnerSignupForm />
      )}
    </div>
  );
}
