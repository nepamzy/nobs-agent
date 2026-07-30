import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { getClients } from "@/lib/data/clients";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Clients",
  description: "Institutions and businesses that have trusted NOBS AGENT with their platforms.",
};

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <PageHeader eyebrow="Clients" title="Who I've built for" />

      {clients.length === 0 ? (
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <Users size={28} className="mx-auto text-[var(--color-brass)]" />
          <p className="mt-4 text-sm text-[var(--color-slate)]">
            Client list goes here as projects launch. Nothing published yet.
          </p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-4 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <div key={client.id} className="glass rounded-xl p-6">
              <p className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-wide">
                {client.organization}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-brass)]">
                {client.sector}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
