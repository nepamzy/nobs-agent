import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ScopingBookNewBrief } from "@/components/admin/scoping-book-new-brief";
import { ClipboardList, ArrowUpRight, Plus } from "lucide-react";

async function getData() {
  try {
    const [clients, briefs] = await Promise.all([
      prisma.client.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, organization: true },
      }),
      prisma.clientBrief.findMany({
        orderBy: { createdAt: "desc" },
        include: { client: { select: { name: true, organization: true } } },
      }),
    ]);
    return { clients, briefs, connected: true };
  } catch {
    return { clients: [], briefs: [], connected: false };
  }
}

export default async function ScopingBookPage() {
  const { clients, briefs, connected } = await getData();

  return (
    <div>
      <h1 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-medium">
        <ClipboardList size={22} className="text-[var(--color-brass)]" /> Scoping Book
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        The discovery checklist for every package. Pick a client below to start their
        brief, or open one already on file.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
          <Plus size={18} className="text-[var(--color-brass)]" /> New brief
        </h2>
        <ScopingBookNewBrief clients={clients} />
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          All briefs ({briefs.length})
        </h2>
        {briefs.length === 0 ? (
          <p className="text-sm text-[var(--color-slate)]">No briefs on file yet.</p>
        ) : (
          <div className="space-y-2">
            {briefs.map((b) => {
              const answers = Array.isArray(b.answers) ? (b.answers as { checked?: boolean }[]) : [];
              const ticked = answers.filter((a) => a.checked).length;
              return (
                <Link
                  key={b.id}
                  href={`/admin/clients/${b.clientId}/briefs/${b.id}`}
                  className="glass group flex items-center justify-between rounded-xl p-4 text-sm transition hover:border-[var(--color-brass)]/50"
                >
                  <div>
                    <p className="font-medium">
                      {b.client.name}
                      {b.client.organization && (
                        <span className="text-[var(--color-slate)]"> &middot; {b.client.organization}</span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-slate)]">
                      {b.packageName} &middot; {ticked}/{answers.length} ticked &middot;{" "}
                      {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
