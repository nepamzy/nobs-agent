"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpRight } from "lucide-react";

type ClientOption = { id: string; name: string; organization: string | null };

export function ScopingBookNewBrief({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.organization?.toLowerCase().includes(q)
    );
  }, [clients, query]);

  return (
    <div>
      <label htmlFor="scoping-client-search" className="mb-1.5 block text-xs font-medium text-[var(--color-slate)]">
        Pick a client to start their brief
      </label>
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
        <input
          id="scoping-client-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients by name or organization..."
          className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-brass)]"
        />
      </div>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-slate)]">
          No clients on file yet — add one on the Clients tab first.
        </p>
      ) : (
        <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-1 py-2 text-sm text-[var(--color-slate)]">No clients match that search.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/admin/clients/${c.id}/briefs/new`)}
                className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/5"
              >
                <span>
                  {c.name}
                  {c.organization && <span className="text-[var(--color-slate)]"> &middot; {c.organization}</span>}
                </span>
                <ArrowUpRight
                  size={14}
                  className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-brass)]"
                />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
