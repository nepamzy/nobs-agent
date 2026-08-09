import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getAllProjectSlugs, getProjectBySlug } from "@/lib/data/projects";
import { getServerLanguage, translateFields } from "@/lib/translate-content";
import { ProjectCover } from "@/components/project-cover";

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const language = await getServerLanguage();
  const { title, summary } = await translateFields(
    { title: project.title, summary: project.summary },
    language
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <Link
        href="/portfolio"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to portfolio
      </Link>

      <p className="mt-8 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {project.industry} · {project.durationWeeks} weeks
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-[var(--color-slate)]">{summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--color-slate)]">Client: {project.clientName}</span>
        {project.liveUrl && (
          <Link
            href={project.liveUrl}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-[var(--color-brass)]"
          >
            View live <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      <ProjectCover
        slug={project.slug}
        industry={project.industry}
        coverImage={project.coverImage}
        className="mt-10 h-80"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {project.technologies.map((t) => (
          <span
            key={t}
            className="rounded-full border border-[var(--color-line)] px-3 py-1 font-[family-name:var(--font-mono)] text-xs text-[var(--color-slate)]"
          >
            {t}
          </span>
        ))}
      </div>

      {project.gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {project.gallery.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element -- remote Cloudinary URL
            <img
              key={url}
              src={url}
              alt=""
              className="aspect-video w-full rounded-lg border border-[var(--color-line)] object-cover"
            />
          ))}
        </div>
      )}

      <div className="mt-16 grid gap-10 sm:grid-cols-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-brass)]">
            Problem
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-slate)]">
            {project.problem}
          </p>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-brass)]">
            Solution
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-slate)]">
            {project.solution}
          </p>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-[var(--color-brass)]">
            Results
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-slate)]">
            {project.results}
          </p>
        </div>
      </div>

      <div className="glass mt-20 flex flex-col items-start gap-4 rounded-2xl p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl font-medium">
            Building something similar?
          </h3>
          <p className="mt-1 text-sm text-[var(--color-slate)]">
            Tell me the shape of the problem, I&apos;ll tell you what it takes.
          </p>
        </div>
        <Link
          href="/booking"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--color-brass)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Start a project <ArrowUpRight size={16} />
        </Link>
      </div>
    </div>
  );
}
