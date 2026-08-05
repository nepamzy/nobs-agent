import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { markInquiryHandled, postAdminInquiryReply } from "../actions";
import { MessageAttachmentInput } from "@/components/message-attachment-input";
import { MessageAttachment } from "@/components/message-attachment";
import { ArrowLeft, Mail, Building2, Check, CheckCircle2 } from "lucide-react";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let inquiry;
  try {
    inquiry = await prisma.contactMessage.findUnique({
      where: { id },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    inquiry = null;
  }

  if (!inquiry) notFound();

  return (
    <div>
      <Link
        href="/admin/inquiries"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to inquiries
      </Link>

      <div className="glass mt-4 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-medium">
              {inquiry.name}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
              <Mail size={12} /> {inquiry.email}
            </p>
            {inquiry.company && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-slate)]">
                <Building2 size={12} /> {inquiry.company}
              </p>
            )}
          </div>

          {inquiry.handled ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 py-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={13} /> Handled
            </span>
          ) : (
            <form action={markInquiryHandled}>
              <input type="hidden" name="id" value={inquiry.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brass)] px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:opacity-90"
              >
                <Check size={13} /> Mark handled
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 rounded-lg bg-white/5 p-4 text-sm leading-relaxed">
          {inquiry.message}
        </div>

        <p className="mt-4 text-xs text-[var(--color-slate)]">
          Received {new Date(inquiry.createdAt).toLocaleString()} via {inquiry.source}
        </p>
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Conversation
        </h2>

        {inquiry.replies.length > 0 && (
          <div className="mb-4 space-y-3">
            {inquiry.replies.map((r: { id: string; fromAdmin: boolean; body: string; attachmentUrl: string | null; attachmentName: string | null; createdAt: Date }) => (
              <div
                key={r.id}
                className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  r.fromAdmin
                    ? "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
                    : "bg-white/5"
                }`}
              >
                <p>{r.body}</p>
                {r.attachmentUrl && r.attachmentName && (
                  <MessageAttachment url={r.attachmentUrl} name={r.attachmentName} />
                )}
                <p className="mt-1 text-[10px] text-[var(--color-slate)]">
                  {r.fromAdmin ? "You" : inquiry.name}, {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <form action={postAdminInquiryReply}>
          <input type="hidden" name="contactMessageId" value={inquiry.id} />
          <MessageAttachmentInput />
          <div className="flex gap-2">
            <input
              name="body"
              placeholder="Reply..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-brass)] px-4 py-2.5 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              Send
            </button>
          </div>
        </form>
        <p className="mt-3 text-xs text-[var(--color-slate)]">
          Sent to {inquiry.email} by email. If this address has a client account, it
          appears in their dashboard too.
        </p>
      </div>
    </div>
  );
}
