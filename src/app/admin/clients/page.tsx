import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createClient,
  updateClient,
  deleteClient,
  createTestimonial,
  toggleTestimonialFeatured,
  deleteTestimonial,
} from "./actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { Plus, Save, Trash2, Star, Eye } from "lucide-react";

function fetchTestimonials() {
  return prisma.testimonial.findMany({ orderBy: { createdAt: "desc" }, include: { client: true } });
}

type ClientRow = Awaited<ReturnType<typeof prisma.client.findMany>>[number];
type TestimonialRow = Awaited<ReturnType<typeof fetchTestimonials>>[number];

async function getData() {
  try {
    const [clients, testimonials] = await Promise.all([
      prisma.client.findMany({ orderBy: { createdAt: "desc" } }),
      fetchTestimonials(),
    ]);
    return { clients, testimonials, connected: true };
  } catch {
    return { clients: [] as ClientRow[], testimonials: [] as TestimonialRow[], connected: false };
  }
}

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-[var(--color-brass)]";

export default async function AdminClientsPage() {
  const { clients, testimonials, connected } = await getData();

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">Clients</h1>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, clients and testimonials created here will
          appear once <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code>{" "}
          is live.
        </div>
      )}

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-medium">
          <Plus size={18} className="text-[var(--color-brass)]" /> Add a client
        </h2>
        <form action={createClient} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
          <input name="name" placeholder="Contact name" required className={inputClass} />
          <input name="organization" placeholder="Organization" className={inputClass} />
          <input name="sector" placeholder="Sector (e.g. Education)" className={inputClass} />
          <input name="logoUrl" placeholder="Logo URL (optional)" className={inputClass} />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {clients.map((c) => (
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

      {connected && clients.length === 0 && (
        <p className="mt-6 text-sm text-[var(--color-slate)]">No clients yet.</p>
      )}

      <h2 className="mt-12 mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
        Testimonials
      </h2>

      <div className="glass rounded-2xl p-6">
        <form action={createTestimonial} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto]">
          <select name="clientId" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Select client
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-[var(--color-ink)]">
                {c.name}
              </option>
            ))}
          </select>
          <input name="quote" placeholder="Quote" required className={inputClass} />
          <select name="rating" defaultValue="5" className={inputClass}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n} className="bg-[var(--color-ink)]">
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Add
          </button>
        </form>
      </div>

      <div className="mt-4 space-y-2">
        {testimonials.map((t) => (
          <div key={t.id} className="glass flex items-center justify-between gap-4 rounded-xl p-4">
            <div>
              <p className="text-sm text-[var(--color-paper)]">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-1 text-xs text-[var(--color-slate)]">
                {t.client?.name} · {t.rating}★
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <form action={toggleTestimonialFeatured}>
                <input type="hidden" name="id" value={t.id} />
                <input type="hidden" name="featured" value={String(t.featured)} />
                <button
                  type="submit"
                  title={t.featured ? "Unfeature" : "Feature"}
                  className="rounded-lg border border-[var(--color-line)] p-2 transition hover:border-[var(--color-brass)]"
                >
                  <Star size={14} className={t.featured ? "fill-[var(--color-brass)] text-[var(--color-brass)]" : ""} />
                </button>
              </form>
              <form action={deleteTestimonial}>
                <input type="hidden" name="id" value={t.id} />
                <ConfirmSubmit
                  message="Delete this testimonial?"
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
