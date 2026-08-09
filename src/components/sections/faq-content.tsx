"use client";

import { PageHeader } from "@/components/page-header";
import { FaqAccordion } from "@/components/faq-accordion";
import { useLanguage } from "@/lib/i18n/language-context";

export function FaqContent() {
  const { t } = useLanguage();

  const faqs = [
    { q: t("faq_q1"), a: t("faq_a1") },
    { q: t("faq_q2"), a: t("faq_a2") },
    { q: t("faq_q3"), a: t("faq_a3") },
    { q: t("faq_q4"), a: t("faq_a4") },
    { q: t("faq_q5"), a: t("faq_a5") },
    { q: t("faq_q6"), a: t("faq_a6") },
  ];

  return (
    <div>
      <PageHeader eyebrow={t("nav_faq")} title={t("faq_title")} description={t("faq_desc")} />
      <div className="mx-auto max-w-2xl px-6 pb-24">
        <FaqAccordion items={faqs} />
      </div>
    </div>
  );
}
