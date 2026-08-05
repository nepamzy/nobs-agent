"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Save, Eye, Trash2 } from "lucide-react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]";

type ClientRow = {
  id: string;
  name: string;
  organization: string | null;
  sector: string | null;
  logoUrl: string | null;
};

export function ClientSearchList({
  clients,
  updateClient,
  deleteClient,
}: {
  clients: ClientRow[];
  updateClient: (formData: FormData) => void;
  deleteClient: (formData: FormData) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = clients.filter((c) => {
    const haystack = `${c.name} ${c.organization ?? ""} ${c.sector ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients by name, organization, or sector..."
          className={`${inputClass} w-full pl-9`}
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">
          {clients.length === 0 ? "No clients yet." : "No clients match that search."}
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="glass flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-center">
            <form action={updateClient} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} className={`${inputClass} sm:w-48`} />
              <input
                name="organization"
                defaultValue={c.organization ?? ""}
                placeholder="Organization"
                className={`${inputClass} flex-1`}
              />
              <input
                name="sector"
                defaultValue={c.sector ?? ""}
                placeholder="Sector"
                className={`${inputClass} sm:w-40`}
              />
              <input
                name="logoUrl"
                defaultValue={c.logoUrl ?? ""}
                placeholder="Logo URL"
                className={`${inputClass} flex-1`}
              />
              <button
                type="submit"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
              >
                <Save size={13} /> Save
              </button>
            </form>
            <Link
              href={`/admin/clients/${c.id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-line)] px-3 py-2 text-xs font-medium transition hover:border-[var(--color-brass)]"
            >
              <Eye size={13} /> View
            </Link>
            <form action={deleteClient}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit
                message={`Delete "${c.name}"? This can't be undone.`}
                title="Delete"
                className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-red-500/50 hover:text-red-400"
              >
                <Trash2 size={14} />
              </ConfirmSubmit>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
