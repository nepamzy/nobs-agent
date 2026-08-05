import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProject, toggleFeatured, toggleHidden } from "./actions";
import { PortfolioSearchList } from "@/components/admin/portfolio-search-list";
import { Plus } from "lucide-react";

type ProjectRow = Awaited<ReturnType<typeof prisma.project.findMany>>[number];

async function getProjects() {
  try {
    const rows = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    return { rows, connected: true };
  } catch {
    return { rows: [] as ProjectRow[], connected: false };
  }
}

export default async function AdminPortfolioPage() {
  const { rows, connected } = await getProjects();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Portfolio
        </h1>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          <Plus size={15} /> New project
        </Link>
      </div>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, projects created here will appear once{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> is live.
        </div>
      )}

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          No projects yet. Create the first one, or run{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">npm run prisma:seed</code>.
        </p>
      )}

      <PortfolioSearchList
        rows={rows}
        toggleFeatured={toggleFeatured}
        toggleHidden={toggleHidden}
        deleteProject={deleteProject}
      />
    </div>
  );
}
