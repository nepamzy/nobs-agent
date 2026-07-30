import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost, togglePublished } from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Plus, Eye, EyeOff, Trash2, Pencil } from "lucide-react";

type BlogPostRow = Awaited<ReturnType<typeof prisma.blogPost.findMany>>[number];

async function getPosts() {
  try {
    const rows = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return { rows, connected: true };
  } catch {
    return { rows: [] as BlogPostRow[], connected: false };
  }
}

export default async function AdminBlogPage() {
  const { rows, connected } = await getPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">Blog</h1>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          <Plus size={15} /> New post
        </Link>
      </div>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, posts created here will appear once{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> is live.
        </div>
      )}

      {connected && rows.length === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">No posts yet. Create the first one.</p>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-5">
            <div>
              <p className="font-medium">
                {row.title}
                <span
                  className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                    row.published
                      ? "border-emerald-500/50 text-emerald-400"
                      : "border-[var(--color-line)] text-[var(--color-slate)]"
                  }`}
                >
                  {row.published ? "Published" : "Draft"}
                </span>
              </p>
              <p className="text-xs text-[var(--color-slate)]">
                {row.category ?? "Uncategorized"} · /blog/{row.slug}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <form action={togglePublished}>
                <input type="hidden" name="id" value={row.id} />
                <input type="hidden" name="published" value={String(row.published)} />
                <button
                  type="submit"
                  title={row.published ? "Unpublish" : "Publish"}
                  className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                >
                  {row.published ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </form>
              <Link
                href={`/admin/blog/${row.id}/edit`}
                className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                title="Edit"
              >
                <Pencil size={14} />
              </Link>
              <form action={deletePost}>
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
