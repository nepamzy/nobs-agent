// Reads from the database (`Project` model) with a graceful fallback to
// sample data, the site stays fully functional before DATABASE_URL points
// at a live, migrated, seeded Postgres instance, and switches over
// automatically the moment real projects exist. Every public page below
// only calls these three functions.

import { prisma } from "@/lib/prisma";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  industry: string;
  technologies: string[];
  durationWeeks: number;
  coverImage: string;
  gallery: string[];
  problem: string;
  solution: string;
  results: string;
  constraints?: string;
  architecture?: string;
  keyEngineeringDecisions?: string;
  security?: string;
  performance?: string;
  clientName: string;
  liveUrl?: string;
  featured: boolean;
};

// No sample projects, this studio's owner wants to add real work only,
// not placeholder portfolio pieces. The public pages below show a genuine
// empty state until real projects exist in the database (via
// /admin/portfolio). This array intentionally stays empty rather than
// being removed, so the fallback pattern (and the "swap for real data"
// comment above) still applies the moment a database is connected.
const fallbackProjects: Project[] = [];

async function fetchFromDb(): Promise<Project[] | null> {
  try {
    const rows = await prisma.project.findMany({
      where: { hidden: false },
      orderBy: { createdAt: "desc" },
      include: { client: true },
    });
    if (rows.length === 0) return null;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      industry: r.industry,
      technologies: r.technologies,
      durationWeeks: r.durationWeeks ?? 0,
      coverImage: r.coverImage,
      gallery: r.gallery,
      problem: r.problem,
      solution: r.solution,
      results: r.results,
      constraints: r.constraints ?? undefined,
      architecture: r.architecture ?? undefined,
      keyEngineeringDecisions: r.keyEngineeringDecisions ?? undefined,
      security: r.security ?? undefined,
      performance: r.performance ?? undefined,
      clientName: r.client?.name ?? "Confidential",
      liveUrl: r.liveUrl ?? undefined,
      featured: r.featured,
    }));
  } catch {
    // Expected until DATABASE_URL points at a live, migrated database.
    return null;
  }
}

export async function getProjects({ featuredOnly = false }: { featuredOnly?: boolean } = {}) {
  const projects = (await fetchFromDb()) ?? fallbackProjects;
  return featuredOnly ? projects.filter((p) => p.featured) : projects;
}

export async function getProjectBySlug(slug: string) {
  const projects = (await fetchFromDb()) ?? fallbackProjects;
  return projects.find((p) => p.slug === slug) ?? null;
}

export async function getAllProjectSlugs() {
  const projects = (await fetchFromDb()) ?? fallbackProjects;
  return projects.map((p) => p.slug);
}
