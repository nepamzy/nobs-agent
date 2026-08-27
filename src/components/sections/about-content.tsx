"use client";

import { Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Founder } from "@/lib/data/founder";

export function AboutContent({ founder }: { founder: Founder }) {
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

      <p className="mt-16 mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        The Engineer Behind NOBS
      </p>
      <div className="glass flex flex-col items-start gap-6 rounded-2xl p-8 sm:flex-row sm:items-center">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[var(--color-line)] bg-white/5">
          {founder.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL
            <img src={founder.photoUrl} alt={founder.name} className="h-full w-full object-cover" />
          )}
        </div>

        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-medium">
            {founder.name}
          </h3>
          <p className="mt-0.5 text-sm text-[var(--color-brass)]">{founder.role}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-slate)]">{founder.bio}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {founder.githubUrl && (
              <a
                href={founder.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-paper)] underline decoration-[var(--color-line)] underline-offset-4 transition hover:decoration-[var(--color-brass)]"
              >
                <Github size={16} />
                {founder.githubUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
            {founder.linkedinUrl && (
              <a
                href={founder.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-paper)] underline decoration-[var(--color-line)] underline-offset-4 transition hover:decoration-[var(--color-brass)]"
              >
                <Linkedin size={16} />
                {founder.linkedinUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
