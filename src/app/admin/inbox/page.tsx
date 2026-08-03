import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { markDeliveredForViewer } from "@/lib/messaging";
import { auth } from "@/auth";
import { InboxTabs } from "@/components/admin/inbox-tabs";
import { ArrowUpRight, CalendarClock } from "lucide-react";

async function getClientThreads() {
  try {
    const clientMessages = await prisma.message.findMany({
      where: { projectId: null, recipientId: null },
      orderBy: { createdAt: "desc" },
      include: { sender: true },
    });

    const byClient = new Map<
      string,
      { name: string; email: string; lastMessage: string; unread: number }
    >();

    for (const m of clientMessages) {
      const existing = byClient.get(m.senderId);
      if (!existing) {
        byClient.set(m.senderId, {
          name: m.sender.name,
          email: m.sender.email,
          lastMessage: m.body,
          unread: m.readAt ? 0 : 1,
        });
      } else if (!m.readAt) {
        existing.unread += 1;
      }
    }

    return Array.from(byClient, ([userId, v]) => ({ userId, ...v }));
  } catch {
    return [];
  }
}

async function getInquiries() {
  try {
    return await prisma.contactMessage.findMany({
      where: { handled: false },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  } catch {
    return [];
  }
}

async function getApplications() {
  try {
    return await prisma.jobApplication.findMany({
      include: {
        job: true,
        messages: { where: { fromAdmin: false, readByAdmin: false } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  } catch {
    return [];
  }
}

async function getPendingBookings() {
  try {
    return await prisma.booking.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
  } catch {
    return [];
  }
}

export default async function AdminInboxPage() {
  const session = await auth();
  if (session) await markDeliveredForViewer(session.user.id);

  const [threads, inquiries, applications] = await Promise.all([
    getClientThreads(),
    getInquiries(),
    getApplications(),
  ]);
  const pendingBookings = await getPendingBookings();

  const messagesTab = (
    <div className="space-y-2">
      {threads.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">No client messages yet.</p>
      )}
      {threads.map((t) => (
        <Link
          key={t.userId}
          href={`/admin/messages/${t.userId}`}
          className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
        >
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-xs text-[var(--color-slate)]">
              {t.lastMessage.slice(0, 70)}
              {t.lastMessage.length > 70 ? "..." : ""}
            </p>
          </div>
          {t.unread > 0 && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
              {t.unread}
            </span>
          )}
        </Link>
      ))}
    </div>
  );

  const inquiriesTab = (
    <div className="space-y-2">
      {inquiries.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">No unhandled inquiries.</p>
      )}
      {inquiries.map((inq) => (
        <Link
          key={inq.id}
          href={`/admin/inquiries/${inq.id}`}
          className="glass group flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
        >
          <div>
            <p className="font-medium">{inq.name}</p>
            <p className="text-xs text-[var(--color-slate)]">
              {inq.message.slice(0, 70)}
              {inq.message.length > 70 ? "..." : ""}
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
          />
        </Link>
      ))}
    </div>
  );

  const applicationsTab = (
    <div className="space-y-2">
      {applications.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">No applications yet.</p>
      )}
      {applications.map((app) => (
        <Link
          key={app.id}
          href={`/admin/careers/applications/${app.id}`}
          className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
        >
          <div>
            <p className="font-medium">{app.name}</p>
            <p className="text-xs text-[var(--color-slate)]">{app.job.title}</p>
          </div>
          {app.messages.length > 0 && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
              {app.messages.length}
            </span>
          )}
        </Link>
      ))}
    </div>
  );

  const bookingsTab = (
    <div className="space-y-2">
      {pendingBookings.length === 0 && (
        <p className="text-sm text-[var(--color-slate)]">No new booking requests.</p>
      )}
      {pendingBookings.map((b) => (
        <Link
          key={b.id}
          href={`/admin/bookings/${b.id}`}
          className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
        >
          <div>
            <p className="font-medium">{b.fullName}</p>
            <p className="text-xs text-[var(--color-slate)]">
              {b.serviceInterest} · {new Date(b.scheduledFor).toLocaleString()}
            </p>
          </div>
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
            <CalendarClock size={12} />
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Inbox
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Every conversation, client messages, bookings, inquiries, and job applications,
        in one place. Pick a tab, then open a conversation to reply.
      </p>

      <div className="mt-6">
        <InboxTabs
          messages={messagesTab}
          inquiries={inquiriesTab}
          applications={applicationsTab}
          bookings={bookingsTab}
          bookingsCount={pendingBookings.length}
        />
      </div>
    </div>
  );
}
