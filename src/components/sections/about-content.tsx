"use client";

import { useLanguage } from "@/lib/i18n/language-context";

export function AboutContent() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {t("nav_about")}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {t("about_title")}
      </h1>

      <div className="mt-10 space-y-5 text-[var(--color-slate)]">
        <p>{t("about_p1")}</p>
        <p>{t("about_p2")}</p>
        <p>{t("about_p3")}</p>
      </div>

      <h2 className="mt-16 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        {t("about_bring_title")}
      </h2>
      <div className="glass space-y-4 rounded-2xl p-8 text-[var(--color-slate)]">
        <p>{t("about_bring_p1")}</p>
        <p>{t("about_bring_p2")}</p>
        <p>{t("about_bring_p3")}</p>
        <p>{t("about_bring_p4")}</p>
      </div>
    </div>
  );
}
