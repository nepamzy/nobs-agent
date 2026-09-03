"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProjectCover } from "@/components/project-cover";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

type Project = {
  slug: string;
  title: string;
  results: string;
  industry: string;
  coverImage: string | null;
};

export function CaseStudiesContent({ projects }: { projects: Project[] }) {
  const { t } = useLanguage();

  return (
    <div>
      <PageHeader
        eyebrow={t("nav_case_studies")}
        title={t("case_studies_title")}
        description={t("case_studies_desc")}
      />

      {projects.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <FolderKanban size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">{t("case_studies_empty")}</p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-16">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/portfolio/${project.slug}`}
              className="group glass flex flex-col gap-6 rounded-2xl p-6 sm:flex-row sm:items-center"
            >
              <ProjectCover
                slug={project.slug}
                industry={project.industry}
                coverImage={project.coverImage ?? undefined}
                title={project.title}
                className="h-40 w-full shrink-0 sm:w-56"
              />
              <div className="flex-1">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
                  {project.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-slate)]">{project.results}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--color-brass)]">
                  {t("case_studies_read")}
                  <ArrowUpRight
                    size={14}
                    className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
