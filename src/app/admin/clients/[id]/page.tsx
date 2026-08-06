import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  ArrowUpRight,
  Mail,
  FolderKanban,
  MessageSquare,
  CreditCard,
  Star,
  CalendarClock,
} from "lucide-react";

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

const projectStatusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  IN_PROGRESS: "In progress",
  REVISION: "Revision",
  DELIVERED: "Delivered",
};

async function getClientDetail(id: string) {
  const client = await prisma.client.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!client) return null;

  const [projects, testimonials, bookings, messages] = await Promise.all([
    prisma.project.findMany({ where: { clientId: id }, orderBy: { updatedAt: "desc" } }),
    prisma.testimonial.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    client.userId
      ? prisma.booking.findMany({ where: { userId: client.userId }, orderBy: { createdAt: "desc" } })
      : prisma.booking.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
    client.userId
      ? prisma.message.findMany({
          where: { projectId: null, OR: [{ senderId: client.userId, recipientId: null }, { recipientId: client.userId }] },
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  return { client, projects, testimonials, bookings, messages };
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data;
  try {
    data = await getClientDetail(id);
  } catch {
    data = null;
  }

  if (!data) notFound();
  const { client, projects, testimonials, bookings, messages } = data;
  const totalPaid = bookings.reduce((sum, b) => sum + b.amountPaid, 0);

  return (
    <div>
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to clients
      </Link>

      <div className="glass mt-4 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
              {client.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-slate)]">
              {client.organization ?? "No organization on file"} · {client.sector ?? "No sector on file"}
            </p>
          </div>
          {client.user && (
            <Link
              href={`/admin/messages/${client.user.id}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              <MessageSquare size={14} /> Message
            </Link>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[var(--color-slate)]">
          {client.user ? (
            <span className="flex items-center gap-1.5">
              <Mail size={13} /> {client.user.email} · Has a portal account
            </span>
          ) : (
            <span>No linked portal account yet</span>
          )}
          {client.user?.phone && <span>{client.user.phone}</span>}
          <span className="flex items-center gap-1.5">
            <CalendarClock size={13} /> Client on file since {new Date(client.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-[var(--color-line)] pt-5">
          <div>
            <p className="text-xs text-[var(--color-slate)]">Projects</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--color-brass)]">
              {projects.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-slate)]">Bookings</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--color-brass)]">
              {bookings.length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-slate)]">Total paid</p>
            <p className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--color-brass)]">
              {formatNaira(totalPaid)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Projects */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
            <FolderKanban size={16} /> Projects ({projects.length})
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">No projects on file.</p>
          ) : (
            <ul className="space-y-2">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/portfolio/${p.id}/edit`}
                    className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition hover:bg-white/5"
                  >
                    <span className="transition group-hover:text-[var(--color-brass)]">{p.title}</span>
                    <span className="flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
                      {projectStatusLabels[p.status] ?? p.status}
                      <ArrowUpRight
                        size={13}
                        className="text-[var(--color-slate)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-brass)]"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bookings & payments */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
            <CreditCard size={16} /> Bookings & payments ({bookings.length})
          </h2>
          {bookings.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">No bookings on file.</p>
          ) : (
            <ul className="space-y-3">
              {bookings.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/admin/bookings/${b.id}`}
                    className="group block rounded-lg px-2 py-1.5 transition hover:bg-white/5"
                  >
                    <p className="flex items-center justify-between text-sm font-medium transition group-hover:text-[var(--color-brass)]">
                      {b.serviceInterest}
                      <ArrowUpRight
                        size={13}
                        className="text-[var(--color-slate)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--color-brass)]"
                      />
                    </p>
                    <p className="text-xs text-[var(--color-slate)]">
                      {b.status}
                      {b.agreedAmount
                        ? ` · ${formatNaira(b.amountPaid)} of ${formatNaira(b.agreedAmount)} paid`
                        : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent messages */}
        <div className="glass rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
              <MessageSquare size={16} /> Recent messages
            </h2>
            {client.user && (
              <Link
                href={`/admin/messages/${client.user.id}`}
                className="text-xs text-[var(--color-brass)] underline underline-offset-4"
              >
                Open full conversation
              </Link>
            )}
          </div>
          {messages.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">No direct messages yet.</p>
          ) : (
            <ul className="space-y-2">
              {messages.map((m) => (
                <li key={m.id} className="text-sm">
                  <span className="text-xs text-[var(--color-slate)]">
                    {m.recipientId ? "You" : client.name}:{" "}
                  </span>
                  {m.body.slice(0, 80)}
                  {m.body.length > 80 ? "..." : ""}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Testimonials */}
        <div className="glass rounded-2xl p-6">
          <h2 className="mb-4 flex items-center gap-1.5 font-[family-name:var(--font-display)] text-lg font-medium">
            <Star size={16} /> Testimonials ({testimonials.length})
          </h2>
          {testimonials.length === 0 ? (
            <p className="text-sm text-[var(--color-slate)]">None submitted yet.</p>
          ) : (
            <ul className="space-y-3">
              {testimonials.map((t) => (
                <li key={t.id} className="text-sm">
                  <p className="text-xs text-[var(--color-slate)]">
                    {t.rating} / 5 {t.approved ? "· Approved" : "· Pending review"}
                  </p>
                  <p className="mt-1">{t.quote}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
