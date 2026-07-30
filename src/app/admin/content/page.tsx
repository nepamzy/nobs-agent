import { prisma } from "@/lib/prisma";
import { upsertSiteContent, createSiteContentField } from "./actions";
import { Save, Plus } from "lucide-react";

type SiteContentRow = Awaited<ReturnType<typeof prisma.siteContent.findMany>>[number];

async function getContentByPage() {
  try {
    const rows = await prisma.siteContent.findMany({ orderBy: [{ page: "asc" }, { key: "asc" }] });
    const grouped = new Map<string, SiteContentRow[]>();
    for (const row of rows) {
      const list = grouped.get(row.page) ?? [];
      list.push(row);
      grouped.set(row.page, list);
    }
    return { grouped, connected: true };
  } catch {
    return { grouped: new Map<string, SiteContentRow[]>(), connected: false };
  }
}

export default async function AdminContentPage() {
  const { grouped, connected } = await getContentByPage();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Site Content
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-slate)]">
        Every editable string on the site lives here as a{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5">page</code> +{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5">key</code> pair. Update a
        value and it goes live immediately, no deploy required.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet. Once <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> is
          set and migrations have run, this page will read and write real content rows.
          Frontend pages fall back to the defaults in{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">src/lib/content.ts</code> until
          then.
        </div>
      )}

      <div className="glass mt-8 rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-medium">
          <Plus size={18} className="text-[var(--color-brass)]" /> Add a field
        </h2>
        <form action={createSiteContentField} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto]">
          <input
            name="page"
            placeholder="page (e.g. home)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]"
          />
          <input
            name="key"
            placeholder="key (e.g. hero.title)"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]"
          />
          <input
            name="value"
            placeholder="value"
            required
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </div>

      {[...grouped.entries()].map(([page, rows]) => (
        <div key={page} className="mt-8">
          <h2 className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
            {page}
          </h2>
          <div className="space-y-3">
            {rows.map((row) => (
              <form
                key={row.id}
                action={upsertSiteContent}
                className="glass flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center"
              >
                <input type="hidden" name="page" value={row.page} />
                <input type="hidden" name="key" value={row.key} />
                <span className="w-full shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--color-slate)] sm:w-48">
                  {row.key}
                </span>
                <textarea
                  name="value"
                  defaultValue={row.value}
                  rows={1}
                  className="w-full flex-1 resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
                >
                  <Save size={13} /> Save
                </button>
              </form>
            ))}
          </div>
        </div>
      ))}

      {connected && grouped.size === 0 && (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          No content fields yet, add one above, or run{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">npm run prisma:seed</code>{" "}
          for a starter set.
        </p>
      )}
    </div>
  );
}
