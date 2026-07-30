import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendAdminDirectReply } from "@/app/dashboard/messages/direct-actions";
import { markThreadReadForAdmin } from "@/lib/messaging";
import { MessageTicks } from "@/components/message-ticks";
import { ArrowLeft } from "lucide-react";

async function getThread(clientUserId: string) {
  const client = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!client) return null;

  const messages = await prisma.message.findMany({
    where: {
      projectId: null,
      OR: [{ senderId: clientUserId, recipientId: null }, { recipientId: clientUserId }],
    },
    orderBy: { createdAt: "asc" },
  });

  return { client, messages };
}

export default async function AdminClientThreadPage({
  params,
}: {
  params: Promise<{ clientUserId: string }>;
}) {
  const { clientUserId } = await params;

  let data;
  try {
    data = await getThread(clientUserId);
  } catch {
    data = null;
  }

  if (!data) notFound();
  const { client, messages } = data;

  await markThreadReadForAdmin(clientUserId);

  return (
    <div>
      <Link
        href="/admin/messages"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to messages
      </Link>

      <h1 className="mt-4 mb-6 font-[family-name:var(--font-display)] text-2xl font-medium">
        {client.name}
      </h1>

      <div className="glass rounded-2xl p-6">
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => {
            const isFromAdmin = m.recipientId !== null;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  isFromAdmin
                    ? "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
                    : "bg-white/5"
                }`}
              >
                <p>{m.body}</p>
                <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-[var(--color-slate)]">
                  <span>{new Date(m.createdAt).toLocaleString()}</span>
                  {isFromAdmin && <MessageTicks deliveredAt={m.deliveredAt} readAt={m.readAt} />}
                </div>
              </div>
            );
          })}
        </div>

        <form action={sendAdminDirectReply} className="mt-4 flex gap-2">
          <input type="hidden" name="clientUserId" value={clientUserId} />
          <input
            name="body"
            required
            placeholder="Reply..."
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
          <button
            type="submit"
            className="rounded-lg bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
