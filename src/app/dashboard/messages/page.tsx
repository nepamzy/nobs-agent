import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendDirectMessage } from "./direct-actions";
import { markDeliveredForViewer, markThreadReadForClient } from "@/lib/messaging";
import { MessageTicks } from "@/components/message-ticks";
import { MessageSquare, ArrowUpRight } from "lucide-react";

async function getDirectThread(userId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        projectId: null,
        OR: [{ senderId: userId, recipientId: null }, { recipientId: userId }],
      },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
    return { messages, connected: true };
  } catch {
    return { messages: [], connected: false };
  }
}

async function getProjectsWithMessageCounts(userId: string) {
  try {
    const projects = await prisma.project.findMany({
      where: { clientUserId: userId },
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return projects;
  } catch {
    return [];
  }
}

export default async function MessagesPage() {
  const session = await auth();
  const userId = session!.user.id;

  await markDeliveredForViewer(userId);
  await markThreadReadForClient(userId);

  const { messages, connected } = await getDirectThread(userId);
  const projects = await getProjectsWithMessageCounts(userId);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Messages
      </h1>

      <div className="glass mt-4 rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Direct message with NOBS AGENT
        </h2>

        {!connected && (
          <p className="text-sm text-[var(--color-slate)]">Not connected to a database yet.</p>
        )}

        {connected && (
          <>
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {messages.length === 0 && (
                <p className="text-sm text-[var(--color-slate)]">
                  No messages yet, say hello.
                </p>
              )}
              {messages.map((m) => {
                const isMine = m.senderId === userId;
                return (
                  <div
                    key={m.id}
                    className={`max-w-[85%] rounded-lg p-3 text-sm ${
                      isMine
                        ? "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
                        : "bg-white/5"
                    }`}
                  >
                    <p>{m.body}</p>
                    <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-[var(--color-slate)]">
                      <span>{new Date(m.createdAt).toLocaleString()}</span>
                      {isMine && <MessageTicks deliveredAt={m.deliveredAt} readAt={m.readAt} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <form action={sendDirectMessage} className="mt-4 flex gap-2">
              <input
                name="body"
                required
                placeholder="Message the studio..."
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>

      {projects.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
            Project conversations
          </h2>
          <div className="space-y-2">
            {projects.map(
              (p: {
                id: string;
                title: string;
                _count: { messages: number };
                messages: { body: string }[];
              }) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="glass group flex items-center justify-between gap-4 rounded-xl p-5 transition hover:border-[var(--color-brass)]/50"
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} className="shrink-0 text-[var(--color-brass)]" />
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-[var(--color-slate)]">
                        {p._count.messages === 0
                          ? "No messages yet"
                          : p.messages[0]?.body.slice(0, 60) + (p.messages[0]?.body.length > 60 ? "..." : "")}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
