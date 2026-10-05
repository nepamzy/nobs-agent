"use client";

import Link from "next/link";
import { Check, ArrowUpRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { NigeriaDiscountBanner } from "@/components/nigeria-discount-banner";
import { pricingGroups, hasStarterAiBundle, type PricingTier } from "@/lib/data/pricing-detailed";
import { aiAutomationTiers } from "@/lib/data/ai-automation-pricing";
import { usePricingText } from "@/lib/i18n/pricing-text";

const tierStyles: Record<PricingTier, string> = {
  Starter: "border-[var(--color-line)] text-[var(--color-slate)]",
  Growth: "border-[var(--color-brass)]/50 text-[var(--color-brass)]",
  Institutional: "border-[var(--color-teal)]/50 text-[var(--color-teal)]",
};

// Client component (unlike most pages' server-rendered content) so the
// copy switches language the instant the visitor picks one, same as
// /services — see src/lib/i18n/pricing-text.ts for the translations.
export function PricingContent() {
  const tp = usePricingText();

  return (
    <div>
      <PageHeader
        eyebrow={tp("Pricing")}
        title={tp("Scoped by category, not guesswork")}
        description={tp(
          "Every category below has a clear, fixed scope — the exact price is set on your consultation call."
        )}
      />

      <div className="mx-auto max-w-3xl px-6">
        <div className="glass rounded-2xl p-6 text-sm text-[var(--color-slate)]">
          <p>
            <span className="font-medium text-[var(--color-brass)]">
              {tp("Pricing is tailored, not listed.")}
            </span>{" "}
            {tp(
              "NOBS AGENT is a newly launched studio, and every project is scoped and quoted individually so you get a real number for your actual work, not a generic card price. Book a free consultation, walk through what you need, and leave with the exact figure."
            )}
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--color-teal)]/40 p-6 text-sm text-[var(--color-slate)]">
          <p className="flex items-center gap-2 font-medium text-[var(--color-teal)]">
            <Sparkles size={16} className="shrink-0" />
            {tp("Every website package comes AI-ready")}
          </p>
          <p className="mt-2">
            {tp(
              "Add Starter AI to any package marked below at a special bundle discount. The size of the discount is agreed with you after your scoping call."
            )}
          </p>
        </div>
      </div>

      <NigeriaDiscountBanner />

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {pricingGroups.map((group) => (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">
              {tp(group.title)}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
              {tp(group.description)}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <div key={item.name} className="glass flex flex-col rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                      {tp(item.name)}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${tierStyles[item.tier]}`}
                    >
                      {tp(item.tier)}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-[var(--color-slate)]">
                    {tp("Tailored pricing — book a free consultation for the exact number.")}
                  </p>

                  <ul className="mt-5 flex-1 space-y-2">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-slate)]">
                        <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-brass)]" />
                        {tp(b)}
                      </li>
                    ))}
                  </ul>

                  {hasStarterAiBundle(item.name) && (
                    <p className="mt-5 flex items-start gap-2 rounded-lg border border-[var(--color-teal)]/30 px-3 py-2 text-xs text-[var(--color-teal)]">
                      <Sparkles size={13} className="mt-0.5 shrink-0" />
                      {tp("Add Starter AI at a bundle discount")}
                    </p>
                  )}

                  <Link
                    href="/booking"
                    className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)]"
                  >
                    {tp("Start this")} <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-16">
        <section id="ai-automation" className="scroll-mt-24">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--color-teal)]" />
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">
              {tp("AI Automation")}
            </h2>
            <span className="rounded-full border border-[var(--color-teal)]/50 px-2.5 py-1 text-[10px] uppercase tracking-wider text-[var(--color-teal)]">
              {tp("New")}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-slate)]">
            {tp(
              "Custom-built AI, shaped around what you actually need it to do: answering customers, helping your staff, or carrying out tasks in your systems with your approval. Every build is scoped to the client, so there's no price here. Book a consultation and we'll quote the specific work."
            )}
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {aiAutomationTiers.map((t) => (
              <div key={t.id} className="glass flex flex-col rounded-2xl p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                  {t.name}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-teal)]">
                  {tp(t.audience)}
                </p>
                <p className="mt-3 text-sm text-[var(--color-slate)]">{tp(t.summary)}</p>

                {t.id === "starter-ai" && (
                  <p className="mt-3 text-xs text-[var(--color-teal)]">
                    {tp("Discounted when added to a website package.")}
                  </p>
                )}

                <ul className="mt-5 flex-1 space-y-2.5">
                  {t.inclusions.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-slate)]">
                      <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-teal)]" />
                      {tp(b)}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/booking"
                  className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-teal)]/50 px-4 py-2.5 text-sm font-medium text-[var(--color-teal)] transition hover:border-[var(--color-teal)]"
                >
                  {tp("Get a custom quote")} <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="glass rounded-2xl p-6 text-sm text-[var(--color-slate)]">
          <p className="mb-2 font-medium text-[var(--color-paper)]">
            {tp("Need something that spans more than one category?")}
          </p>
          <p>
            {tp(
              "A hotel that also wants a full brand identity, a school that wants a portal and a public site redesign, that's normal, not an edge case. Book a consultation and describe the whole scope, pricing for combined work is handled directly rather than by stacking category prices."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
