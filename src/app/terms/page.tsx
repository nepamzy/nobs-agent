import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing engagements with NOBS AGENT.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Legal
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-3 text-sm text-[var(--color-slate)]">Last updated: July 9, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--color-slate)]">
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            1. Engagements
          </h2>
          <p>
            Each project begins with a written proposal covering scope, timeline, and
            price. Work outside that scope is quoted separately before it begins, you
            will never see surprise charges for work you didn&apos;t approve.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            2. Payment terms
          </h2>
          <p>
            Projects are typically billed in milestones: a deposit to begin, a payment at
            a defined midpoint, and a final payment on delivery. Late payments may pause
            active work until resolved.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            3. Ownership
          </h2>
          <p>
            Once a project is paid in full, you own the code, content, and design
            produced for you. Reusable internal tools, frameworks, and components built
            prior to your engagement remain the property of NOBS AGENT.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            4. Revisions & support
          </h2>
          <p>
            Each plan includes a defined number of revision rounds and a post-launch
            support window, both stated in your proposal. Work beyond that window is
            billed at the current maintenance rate.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            5. Liability
          </h2>
          <p>
            We take security and reliability seriously, but we cannot guarantee
            uninterrupted uptime for third-party infrastructure (hosting providers,
            payment processors, etc.) outside our direct control.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
            6. Contact
          </h2>
          <p>Questions about these terms can be sent to nobsagent0@gmail.com.</p>
        </section>
      </div>
    </div>
  );
}
