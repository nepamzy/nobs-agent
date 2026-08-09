"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { siteContent } from "@/lib/content";
import { useLanguage } from "@/lib/i18n/language-context";

export function CtaSection() {
  const { cta } = siteContent;
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-25" />
      <div className="mx-auto max-w-4xl px-6 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight sm:text-4xl"
        >
          {t("cta_title")}
        </motion.h2>
        <p className="mx-auto mt-4 max-w-md text-[var(--color-slate)]">{t("cta_subtitle")}</p>
        <Link
          href={cta.buttonHref}
          className="mt-8 inline-flex rounded-full bg-[var(--color-brass)] px-7 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          {t("cta_button")}
        </Link>
      </div>
    </section>
  );
}
