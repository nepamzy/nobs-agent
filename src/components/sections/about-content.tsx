"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Founder } from "@/lib/data/founder";
import { isCloudinaryUrl } from "@/lib/is-cloudinary-url";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function LinkedinIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z" />
    </svg>
  );
}

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
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[var(--color-line)] bg-white/5">
          {founder.photoUrl && isCloudinaryUrl(founder.photoUrl) ? (
            <Image src={founder.photoUrl} alt={founder.name} fill sizes="96px" className="object-cover" />
          ) : founder.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- manually pasted URL, host not known ahead of time so next/image can't optimize it
            <img src={founder.photoUrl} alt={founder.name} className="h-full w-full object-cover" />
          ) : null}
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
                <GithubIcon size={16} />
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
                <LinkedinIcon size={16} />
                {founder.linkedinUrl.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
