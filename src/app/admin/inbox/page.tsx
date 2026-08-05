import { prisma } from "@/lib/prisma";
import { markDeliveredForViewer } from "@/lib/messaging";
import { auth } from "@/auth";
import { InboxTabs } from "@/components/admin/inbox-tabs";

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
    const rows = await prisma.jobApplication.findMany({
      include: {
        job: true,
        messages: { where: { fromAdmin: false, readByAdmin: false } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });
    return rows.map((app) => ({
      id: app.id,
      name: app.name,
      jobTitle: app.job.title,
      unread: app.messages.length,
    }));
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

  const [threads, inquiries, applications, pendingBookings] = await Promise.all([
    getClientThreads(),
    getInquiries(),
    getApplications(),
    getPendingBookings(),
  ]);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Inbox
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Every conversation, client messages, bookings, inquiries, and job applications,
        in one place. Search within a tab, then open a conversation to reply.
      </p>

      <div className="mt-6">
        <InboxTabs
          threads={threads}
          inquiries={inquiries}
          applications={applications}
          bookings={pendingBookings}
        />
      </div>
    </div>
  );
}
