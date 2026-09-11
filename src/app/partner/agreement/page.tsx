import type { Metadata } from "next";
import { AGREEMENT_SECTIONS, AGREEMENT_INTRO_PARAGRAPHS } from "@/lib/referral-agreement-content";

export const metadata: Metadata = {
  title: "Referral Partner Agreement",
  description: "The terms that govern the NOBS AGENT referral partner program.",
  alternates: { canonical: "/partner/agreement" },
};

export default function ReferralAgreementPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs uppercase tracking-wider text-[var(--color-brass)]">NOBS AGENT</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-medium">
        Referral Partner Agreement
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Non-Exclusive Commission-Based Referral Arrangement. This is the reference copy you agree
        to when creating a referral partner account — once your account exists, a copy filled in
        with your details and account-creation date is emailed to you and available on your
        dashboard to download and sign.
      </p>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        This agreement works alongside, and doesn&apos;t replace, our{" "}
        <a href="/privacy" className="text-[var(--color-brass)] underline underline-offset-4">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="/terms" className="text-[var(--color-brass)] underline underline-offset-4">
          Terms
        </a>
        , which also apply to your account.
      </p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--color-slate)]">
        {AGREEMENT_INTRO_PARAGRAPHS.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {AGREEMENT_SECTIONS.map((section) => (
          <div key={section.number}>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
              {section.number}. {section.title}
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-slate)]">
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-xs text-[var(--color-slate)]">
        Questions about this agreement? Contact nobsagent0@gmail.com.
      </p>
    </div>
  );
}
