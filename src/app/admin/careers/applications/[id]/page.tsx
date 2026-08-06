import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { postAdminReply, markApplicationMessagesRead } from "./actions";
import { ApplicationStatusSelect } from "@/components/admin/application-status-select";
import { MessageAttachmentInput } from "@/components/message-attachment-input";
import { MessageAttachment } from "@/components/message-attachment";
import { toDownloadUrl } from "@/lib/cloudinary-download";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let application;
  try {
    application = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: true, messages: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    application = null;
  }

  if (!application) notFound();

  const hasUnread = application.messages.some(
    (m: { fromAdmin: boolean; readByAdmin: boolean }) => !m.fromAdmin && !m.readByAdmin
  );

  return (
    <div>
      <Link
        href={`/admin/careers/postings/${application.jobId}/applications`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-slate)] hover:text-[var(--color-brass)]"
      >
        <ArrowLeft size={15} /> Back to applicants
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
            {application.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-slate)]">
            {application.email} · Applied for {application.job.title}
          </p>
          {application.resumeUrl && (
            <a
              href={toDownloadUrl(application.resumeUrl, "resume.pdf")}
              className="mt-2 inline-flex items-center gap-1.5 text-sm text-[var(--color-brass)] underline underline-offset-4"
            >
              <FileText size={14} /> View resume
            </a>
          )}
        </div>

        <ApplicationStatusSelect applicationId={application.id} currentStatus={application.status} />
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
            Conversation
          </h2>
          {hasUnread && (
            <form action={markApplicationMessagesRead}>
              <input type="hidden" name="applicationId" value={application.id} />
              <button type="submit" className="text-xs text-[var(--color-brass)] hover:underline">
                Mark all read
              </button>
            </form>
          )}
        </div>

        <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {application.messages.map((m: { id: string; fromAdmin: boolean; body: string; attachmentUrl: string | null; attachmentName: string | null; createdAt: Date }) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                m.fromAdmin
                  ? "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
                  : "bg-white/5"
              }`}
            >
              <p>{m.body}</p>
              {m.attachmentUrl && m.attachmentName && (
                <MessageAttachment url={m.attachmentUrl} name={m.attachmentName} />
              )}
              <p className="mt-1 text-[10px] text-[var(--color-slate)]">
                {m.fromAdmin ? "You" : application.name} · {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form action={postAdminReply} className="mt-4">
          <input type="hidden" name="applicationId" value={application.id} />
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
      </div>
    </div>
  );
}
