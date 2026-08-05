"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Star, EyeOff, Eye, Trash2, Pencil } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]";

type ProjectRow = {
  id: string;
  title: string;
  slug: string;
  industry: string;
  hidden: boolean;
  featured: boolean;
};

export function PortfolioSearchList({
  rows,
  toggleFeatured,
  toggleHidden,
  deleteProject,
}: {
  rows: ProjectRow[];
  toggleFeatured: (formData: FormData) => void;
  toggleHidden: (formData: FormData) => void;
  deleteProject: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = rows.filter((row) => {
    const haystack = `${row.title} ${row.industry} ${row.slug}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects by title, industry, or slug..."
          className={`${inputClass} w-full pl-9`}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">
          {rows.length === 0 ? "No projects yet." : "No projects match that search."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((row) => (
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
