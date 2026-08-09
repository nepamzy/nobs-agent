"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowUpRight, Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Role = {
  id: string;
  title: string;
  department: string | null;
  location: string;
  type: string;
};

export function CareersContent({ roles }: { roles: Role[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader eyebrow={t("nav_careers")} title={t("careers_title")} description={t("careers_desc")} />
      <div className="mx-auto max-w-2xl px-6 pb-24">
        {roles.length === 0 ? (
          <div className="glass mt-8 rounded-2xl p-8 text-center">
            <p className="text-sm text-[var(--color-slate)]">{t("careers_empty")}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              {t("careers_introduce")}
            </Link>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {roles.map((role) => (
              <li key={role.id}>
                <Link
                  href={`/careers/${role.id}`}
                  className="glass group flex items-center justify-between rounded-xl px-5 py-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="shrink-0 text-[var(--color-brass)]" />
                    <div>
                      <p className="font-medium">{role.title}</p>
                      <p className="text-xs text-[var(--color-slate)]">
                        {role.department ? `${role.department} \u00b7 ` : ""}
                        {role.location} {"\u00b7"} {role.type}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
