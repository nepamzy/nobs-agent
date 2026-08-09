"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

export function ResourcesContent() {
  const { t } = useLanguage();

  const resources = [
    { title: t("res1_title"), desc: t("res1_desc"), action: t("res_action_profile"), icon: BookOpen, href: "/about" },
    { title: t("res2_title"), desc: t("res2_desc"), action: t("res_action_guide"), icon: ArrowUpRight, href: "/blog/how-to-brief-a-developer-properly" },
    { title: t("res3_title"), desc: t("res3_desc"), action: t("res_action_guide"), icon: ArrowUpRight, href: "/blog/why-school-portals-fail-in-year-two" },
    { title: t("res4_title"), desc: t("res4_desc"), action: t("res_action_guide"), icon: ArrowUpRight, href: "/blog/paystack-vs-flutterwave-vs-stripe" },
    { title: t("res5_title"), desc: t("res5_desc"), action: t("res_action_guide"), icon: ArrowUpRight, href: "/blog/the-real-cost-of-a-cheap-website" },
    { title: t("res6_title"), desc: t("res6_desc"), action: t("res_action_guide"), icon: ArrowUpRight, href: "/blog/why-you-need-a-whatsapp-button-not-just-a-contact-form" },
  ];

  return (
    <div>
      <PageHeader eyebrow={t("nav_resources")} title={t("resources_title")} />
      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mt-8 space-y-4">
          {resources.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="glass group flex items-center justify-between gap-6 rounded-2xl p-6 transition hover:border-[var(--color-brass)]/50"
            >
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-medium">
                  {r.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-slate)]">{r.desc}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-sm text-[var(--color-brass)]">
                {r.action}
                <r.icon size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
