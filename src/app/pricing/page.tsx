import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { pricingGroups, type PricingTier } from "@/lib/data/pricing-detailed";
import { Check, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Transparent pricing by category, with current launch rates.",
};

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const tierStyles: Record<PricingTier, string> = {
  Starter: "border-[var(--color-line)] text-[var(--color-slate)]",
  Growth: "border-[var(--color-brass)]/50 text-[var(--color-brass)]",
  Institutional: "border-[var(--color-teal)]/50 text-[var(--color-teal)]",
};

export default function PricingPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pricing"
        title="Priced by category, not guesswork"
        description="Every price below is specific to the work, not a vague range."
      />

      <div className="mx-auto max-w-3xl px-6">
        <div className="glass rounded-2xl p-6 text-sm text-[var(--color-slate)]">
          <p>
            <span className="font-medium text-[var(--color-brass)]">
              These are launch prices.
            </span>{" "}
            NOBS AGENT is a newly launched studio, and these rates reflect that. The
            crossed-out amount on each card is the standard rate this work is actually
            worth, the active price next to it is what you pay right now, while the
            studio is building its first track record. This won&apos;t be the pricing
            forever, it moves toward the standard rate as the portfolio grows.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-16 px-6 py-16">
        {pricingGroups.map((group) => (
          <section key={group.id} id={group.id}>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">
              {group.title}
            </h2>
            <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
              {group.description}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <div key={item.name} className="glass flex flex-col rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                      {item.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider ${tierStyles[item.tier]}`}
                    >
                      {item.tier}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="font-[family-name:var(--font-mono)] text-sm text-red-500 line-through decoration-2">
                      {formatNaira(item.standardPrice)}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)]">
                      {formatNaira(item.launchPrice)}
                    </span>
                    {item.unit && (
                      <span className="text-xs text-[var(--color-slate)]">{item.unit}</span>
                    )}
                  </div>

                  <ul className="mt-5 flex-1 space-y-2">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-slate)]">
                        <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-brass)]" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/booking"
                    className="mt-6 inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2.5 text-sm font-medium transition hover:border-[var(--color-brass)]"
                  >
                    Start this <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="glass rounded-2xl p-6 text-sm text-[var(--color-slate)]">
          <p className="mb-2 font-medium text-[var(--color-paper)]">
            Need something that spans more than one category?
          </p>
          <p>
            A hotel that also wants a full brand identity, a school that wants a portal
            and a public site redesign, that&apos;s normal, not an edge case. Book a
            consultation and describe the whole scope, pricing for combined work is
            handled directly rather than by stacking category prices.
          </p>
        </div>
      </div>
    </div>
  );
}
