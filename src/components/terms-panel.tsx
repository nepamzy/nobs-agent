import { TERMS_SECTIONS, TERMS_INTRO, TERMS_VERSION_DATE } from "@/lib/terms-content";

// Shown directly beneath every booking form, above the "I agree" checkbox
// that gates submission. Purely presentational (no hooks, works in both a
// server component like the new-project form and a client component like
// BookingForm) — the full legal text, not a summary, since this is what
// the Client is actually agreeing to. Not translated: the live-translated
// copy lives at /terms for anyone who wants to read it in another language
// first; what gets ticked here is the authoritative English text.
export function TermsPanel() {
  return (
    <details className="glass rounded-xl border border-[var(--color-line)] p-4">
      <summary className="cursor-pointer text-sm font-medium text-[var(--color-paper)]">
        Read the Terms and Conditions
      </summary>
      <div className="mt-4 max-h-72 space-y-4 overflow-y-auto pr-2 text-xs leading-relaxed text-[var(--color-slate)]">
        {TERMS_INTRO.map((p, i) => (
          <p key={`intro-${i}`}>{p}</p>
        ))}
        {TERMS_SECTIONS.map((section) => (
          <div key={section.number}>
            <p className="mb-1 font-medium text-[var(--color-paper)]">
              {section.number}. {section.title}
            </p>
            {section.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ))}
        <p className="text-[var(--color-slate)]/70">Version dated {TERMS_VERSION_DATE}.</p>
      </div>
    </details>
  );
}
