import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProjectCover } from "@/components/project-cover";
import { getProjects } from "@/lib/data/projects";
import { ArrowUpRight, FolderKanban } from "lucide-react";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "In-depth breakdowns of problem, solution, and measured results from select projects.",
};

export default async function CaseStudiesPage() {
  const projects = await getProjects();

  return (
    <div>
      <PageHeader
        eyebrow="Case Studies"
        title="A closer look at how these were built"
        description="The problem, the solution, and the measured result behind every project. Some recent projects are under NDA and cannot be shared."
      />

      {projects.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <FolderKanban size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            Case studies go here as projects launch. Nothing published yet.
          </p>
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
                coverImage={project.coverImage}
                className="h-40 w-full shrink-0 sm:w-56"
              />
              <div className="flex-1">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-medium">
                  {project.title}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-slate)]">{project.results}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--color-brass)]">
                  Read the case study
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
