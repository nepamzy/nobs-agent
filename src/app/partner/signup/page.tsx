import type { Metadata } from "next";
import Image from "next/image";
import { PartnerSignupForm } from "@/components/partner-signup-form";

export const metadata: Metadata = {
  title: "Become a referral partner",
  robots: { index: false },
  alternates: {
    canonical: "/partner/signup",
  },
};

export default function PartnerSignupPage() {
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
      <PartnerSignupForm />
    </div>
  );
}
