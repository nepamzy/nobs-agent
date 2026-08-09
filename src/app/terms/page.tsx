import type { Metadata } from "next";
import { getServerLanguage, translateList } from "@/lib/translate-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing engagements with NOBS AGENT.",
};

const sections = [
  {
    heading: "1. Engagements",
    body: "Each project begins with a written proposal covering scope, timeline, and price. Work outside that scope is quoted separately before it begins, you will never see surprise charges for work you didn't approve.",
  },
  {
    heading: "2. Payment terms",
    body: "Projects are typically billed in milestones: a deposit to begin, a payment at a defined midpoint, and a final payment on delivery. Late payments may pause active work until resolved.",
  },
  {
    heading: "3. Ownership",
    body: "Once a project is paid in full, you own the code, content, and design produced for you. Reusable internal tools, frameworks, and components built prior to your engagement remain the property of NOBS AGENT.",
  },
  {
    heading: "4. Revisions & support",
    body: "Each plan includes a defined number of revision rounds and a post-launch support window, both stated in your proposal. Work beyond that window is billed at the current maintenance rate.",
  },
  {
    heading: "5. Liability",
    body: "We take security and reliability seriously, but we cannot guarantee uninterrupted uptime for third-party infrastructure (hosting providers, payment processors, etc.) outside our direct control.",
  },
  {
    heading: "6. Contact",
    body: "Questions about these terms can be sent to nobsagent0@gmail.com.",
  },
];

// Same reasoning as the privacy policy: legal text is live-translated,
// not hand-written per language, real legal weight deserves that
// caution rather than a quick hand translation.
export default async function TermsPage() {
  const language = await getServerLanguage();
  const headings = await translateList(sections.map((s) => s.heading), language);
  const bodies = await translateList(sections.map((s) => s.body), language);
  const legalLabel = (await translateList(["Legal"], language))[0];
  const title = (await translateList(["Terms of Service"], language))[0];
  const lastUpdated = (await translateList(["Last updated: July 9, 2026"], language))[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {legalLabel}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-slate)]">{lastUpdated}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[var(--color-slate)]">
        {sections.map((_, i) => (
          <section key={i}>
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-paper)]">
              {headings[i]}
            </h2>
            <p>{bodies[i]}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
