"use client";

import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { Carousel3D } from "@/components/carousel-3d";
import { HashScroll } from "@/components/hash-scroll";
import { PriceDisplay } from "@/components/price-display";
import { useLanguage } from "@/lib/i18n/language-context";
import { pricingGroups } from "@/lib/data/pricing-detailed";

// Ongoing Care is recurring, not a one-time delivery, so it gets its own
// timeline copy instead of a week range.
const TIMELINE_BY_GROUP: Record<string, string> = {
  institutional: "Typically 2–3 weeks for a standard build, longer for larger scope",
  commerce: "Typically 2–3 weeks for a standard build, longer for larger scope",
  corporate: "Typically 2–3 weeks for a standard build, longer for larger scope",
  product: "Typically 2–3 weeks as a baseline, scoped up for custom systems",
  care: "Ongoing — starts once your platform is live, no fixed end date",
};

export function ServicesContent({ hasPortfolioExamples }: { hasPortfolioExamples: boolean }) {
  const { t } = useLanguage();

  const groups = [
    { id: "institutional", title: t("service_institutional_name"), desc: t("svc_institutional_desc_full") },
    { id: "commerce", title: t("service_commerce_name"), desc: t("svc_commerce_desc_full") },
    { id: "corporate", title: t("service_corporate_name"), desc: t("svc_corporate_desc_full") },
    { id: "product", title: t("service_product_name"), desc: t("svc_product_desc_full") },
    { id: "care", title: t("svc_care_name"), desc: t("svc_care_desc_full") },
  ];

  const items = groups.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.desc,
    href: "/booking",
    meta: `${t("services_start_project")} \u2192`,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <HashScroll />
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {t("nav_services")}
      </p>
      <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {t("services_page_title")}
      </h1>
      <p className="mt-4 max-w-lg text-sm text-[var(--color-slate)]">
        {t("services_page_hint")}
      </p>

      <div className="mt-14">
        <Carousel3D items={items} orientation="vertical" />
      </div>

      <div className="mt-24 space-y-6">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Every service, broken down
        </h2>

        {pricingGroups.map((group) => {
          const cheapestItem = [...group.items].sort((a, b) => a.launchPrice - b.launchPrice)[0];
          return (
            <div key={group.id} id={`${group.id}-detail`} className="glass rounded-2xl p-8">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-medium">
                {group.title}
              </h3>

              <div className="mt-5 grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-brass)]">
                    Best for
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-slate)]">{group.description}</p>

                  <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-brass)]">
                    Typical timeline
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-slate)]">
                    {TIMELINE_BY_GROUP[group.id]}
                  </p>

                  <p className="mt-5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-brass)]">
                    Starting price
                  </p>
                  <p className="mt-1.5 text-sm text-[var(--color-paper)]">
                    <PriceDisplay ngnAmount={cheapestItem.launchPrice} />
                    {cheapestItem.unit ?? ""}
                  </p>
                </div>

                <div>
                  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-wider text-[var(--color-brass)]">
                    What you get
                  </p>
                  <ul className="mt-1.5 space-y-1.5">
                    {cheapestItem.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[var(--color-slate)]">
                        <Check size={14} className="mt-0.5 shrink-0 text-[var(--color-brass)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] pt-6">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-paper)] transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
                >
                  See full pricing
                </Link>
                {hasPortfolioExamples && (
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-paper)] transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
                  >
                    Example projects
                  </Link>
                )}
                <Link
                  href="/booking"
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
                >
                  Start this <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
