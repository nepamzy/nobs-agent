import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProject, toggleFeatured, toggleHidden } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Plus, Star, EyeOff, Eye, Trash2, Pencil } from "lucide-react";

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

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-5">
            <div>
              <p className="font-medium">
                {row.title}
                {row.hidden && (
                  <span className="ml-2 rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-slate)]">
                    Hidden
                  </span>
                )}
                {row.featured && (
                  <span className="ml-2 rounded-full border border-[var(--color-brass)]/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-brass)]">
                    Featured
                  </span>
                )}
              </p>
              <p className="text-xs text-[var(--color-slate)]">
                {row.industry} · /portfolio/{row.slug}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <form action={toggleFeatured}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="featured" value={String(row.featured)} />
                <button
                  type="submit"
                  title={row.featured ? "Unfeature" : "Feature"}
                  className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                >
                  <Star size={14} className={row.featured ? "fill-[var(--color-brass)] text-[var(--color-brass)]" : ""} />
                </button>
              </form>
              <form action={toggleHidden}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="hidden" value={String(row.hidden)} />
                <button
                  type="submit"
                  title={row.hidden ? "Show on site" : "Hide from site"}
                  className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                >
                  {row.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </form>
              <Link
                href={`/admin/portfolio/${row.id}/edit`}
                className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                title="Edit"
              >
                <Pencil size={14} />
              </Link>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={row.id} />
                <ConfirmSubmit
                  message={`Delete "${row.title}"? This can't be undone.`}
                  title="Delete"
                  className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-red-500/50 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </ConfirmSubmit>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
