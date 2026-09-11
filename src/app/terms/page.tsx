import type { Metadata } from "next";
import { getServerLanguage, translateList } from "@/lib/translate-content";
import { TERMS_SECTIONS, TERMS_INTRO, TERMS_VERSION_DATE } from "@/lib/terms-content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing engagements with NOBS AGENT.",
  alternates: {
    canonical: "/terms",
  },
};

// Full legal text, not a marketing summary — this is the exact document a
// client ticks "I agree" to on the booking form (see TermsPanel), so it
// has to be the real thing, not a shortened version of it.
const sections = TERMS_SECTIONS.map((s) => ({
  heading: `${s.number}. ${s.title}`,
  body: s.paragraphs.join(" "),
}));

// Same reasoning as the privacy policy: legal text is live-translated,
// not hand-written per language, real legal weight deserves that
// caution rather than a quick hand translation.
export default async function TermsPage() {
  const language = await getServerLanguage();
  const intro = await translateList(TERMS_INTRO, language);
  const headings = await translateList(sections.map((s) => s.heading), language);
  const bodies = await translateList(sections.map((s) => s.body), language);
  const legalLabel = (await translateList(["Legal"], language))[0];
  const title = (await translateList(["Terms of Service"], language))[0];
  const lastUpdated = (await translateList([`Version dated ${TERMS_VERSION_DATE}`], language))[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {legalLabel}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-[var(--color-slate)]">{lastUpdated}</p>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-[var(--color-slate)]">
        {intro.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--color-slate)]">
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
