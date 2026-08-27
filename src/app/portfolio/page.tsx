import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProjectCover } from "@/components/project-cover";
import { getProjects } from "@/lib/data/projects";
import { ArrowUpRight, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Websites and platforms built for schools, hospitals, hotels, dealerships, and growing businesses.",
};

export default async function PortfolioPage() {
  const projects = await getProjects();

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Work built for real institutions"
        description="Every project below is live, in production, running real payments or real operations, not a mockup. Some recent projects are under NDA and cannot be shared."
      />

      {projects.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <FolderKanban size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            Portfolio projects go here as they launch. Nothing published yet.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 sm:grid-cols-2">
          {projects.map((project) => {
            return (
              <div key={project.slug} className="group flex flex-col">
                <Link href={`/portfolio/${project.slug}`}>
                  <ProjectCover
                    slug={project.slug}
                    industry={project.industry}
                    coverImage={project.coverImage}
                    title={project.title}
                    className="h-64 transition group-hover:opacity-90"
                  />
                </Link>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <Link href={`/portfolio/${project.slug}`}>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
                      {project.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-slate)]">{project.summary}</p>
                  </Link>
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="mt-1 shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  >
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {project.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[var(--color-line)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[11px] text-[var(--color-slate)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-medium text-[var(--color-paper)] transition hover:border-[var(--color-brass)] hover:text-[var(--color-brass)]"
                  >
                    Case study
                  </Link>
                  {project.liveUrl && (
                    <Link
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
                    >
                      Visit live site <ArrowUpRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
