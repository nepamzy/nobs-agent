import Link from "next/link";
import { prisma } from "@/lib/prisma";

async function getStats() {
  try {
    const [projects, posts, clients, unhandledInquiries, pendingBookings] = await Promise.all([
      prisma.project.count(),
      prisma.blogPost.count(),
      prisma.client.count(),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ]);
    return { projects, posts, clients, unhandledInquiries, pendingBookings, connected: true };
  } catch {
    // Expected until DATABASE_URL points at a live, migrated database.
    return { projects: 0, posts: 0, clients: 0, unhandledInquiries: 0, pendingBookings: 0, connected: false };
  }
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  const cards = [
    { label: "Portfolio projects", value: stats.projects, href: "/admin/portfolio" },
    { label: "Blog posts", value: stats.posts, href: "/admin/blog" },
    { label: "Clients", value: stats.clients, href: "/admin/clients" },
    { label: "Unhandled inquiries", value: stats.unhandledInquiries, href: "/admin/inbox" },
    { label: "Pending bookings", value: stats.pendingBookings, href: "/admin/bookings" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Overview
      </h1>

      {!stats.connected && (
        <div className="glass mt-4 rounded-xl border-yellow-500/30 p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet, these figures will populate once{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5">DATABASE_URL</code> points at a
          live, migrated Postgres instance.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="glass rounded-2xl p-6 transition hover:border-[var(--color-brass)]/50">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-medium text-[var(--color-brass)]">
              {c.value}
            </p>
            <p className="mt-1 text-sm text-[var(--color-slate)]">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="glass mt-8 rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
          Start here
        </h2>
        <p className="mt-2 text-sm text-[var(--color-slate)]">
          Edit homepage and page copy in{" "}
          <Link href="/admin/content" className="text-[var(--color-brass)] underline underline-offset-4">
            Site Content
          </Link>
          , respond to new messages in{" "}
          <Link href="/admin/inbox" className="text-[var(--color-brass)] underline underline-offset-4">
            Inbox
          </Link>
          , and confirm requested consultations in{" "}
          <Link href="/admin/bookings" className="text-[var(--color-brass)] underline underline-offset-4">
            Bookings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
