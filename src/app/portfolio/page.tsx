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
        description="Every project below is live, in production, running real payments or real operations, not a mockup."
      />

      {projects.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <FolderKanban size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            Portfolio projects go here as they launch. Nothing published yet.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2">
          {projects.map((project) => {
            const external = Boolean(project.liveUrl);
            return (
              <Link
                key={project.slug}
                href={project.liveUrl || `/portfolio/${project.slug}`}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group flex flex-col"
              >
                <ProjectCover
                  slug={project.slug}
                  industry={project.industry}
                  coverImage={project.coverImage}
                  className="h-52"
                />
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
                      {project.title}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--color-slate)]">{project.summary}</p>
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="mt-1 shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
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
                  {external && (
                    <span className="ml-auto text-[11px] text-[var(--color-brass)]">
                      Visit site ↗
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
