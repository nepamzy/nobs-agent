import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { postApplicantMessage } from "./actions";
import { CheckCircle2, Circle } from "lucide-react";

export const metadata: Metadata = {
  title: "Your application",
  robots: { index: false, follow: false },
};

const STATUS_ORDER = ["RECEIVED", "IN_REVIEW", "INTERVIEWING", "HIRED"] as const;
const STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Received",
  IN_REVIEW: "In review",
  INTERVIEWING: "Interviewing",
  REJECTED: "Not moving forward",
  HIRED: "Hired",
};

async function markMessagesReadByApplicant(applicationId: string) {
  try {
    await prisma.jobMessage.updateMany({
      where: { applicationId, fromAdmin: true, readByApplicant: false },
      data: { readByApplicant: true },
    });
  } catch {
    // non-critical, skip silently
  }
}

export default async function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  let application;
  try {
    application = await prisma.jobApplication.findUnique({
      where: { accessToken: token },
      include: {
        job: true,
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
  } catch {
    application = null;
  }

  if (!application) notFound();

  await markMessagesReadByApplicant(application.id);

  const isRejected = application.status === "REJECTED";
  const currentStepIndex = STATUS_ORDER.indexOf(
    application.status as (typeof STATUS_ORDER)[number]
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-24">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        Your application
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight">
        {application.job.title}
      </h1>

      <div className="glass mt-6 rounded-2xl p-6">
        {isRejected ? (
          <p className="text-sm text-[var(--color-slate)]">
            This application isn&apos;t moving forward right now. Thank you for applying,
            and feel free to check back for future roles.
          </p>
        ) : (
          <div className="flex items-center justify-between">
            {STATUS_ORDER.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  {i <= currentStepIndex ? (
                    <CheckCircle2 size={16} className="text-[var(--color-brass)]" />
                  ) : (
                    <Circle size={16} className="text-[var(--color-slate)]/50" />
                  )}
                  <span
                    className={`text-center text-[10px] uppercase tracking-wider ${
                      i <= currentStepIndex ? "text-[var(--color-brass)]" : "text-[var(--color-slate)]/60"
                    }`}
                  >
                    {STATUS_LABELS[step]}
                  </span>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div
                    className={`mx-1 h-px flex-1 ${
                      i < currentStepIndex ? "bg-[var(--color-brass)]" : "bg-[var(--color-line)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass mt-6 rounded-2xl p-6">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
          Conversation
        </h2>
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {application.messages.map((m: { id: string; fromAdmin: boolean; body: string; createdAt: Date }) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                m.fromAdmin
                  ? "bg-white/5"
                  : "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] text-[var(--color-slate)]">
                {m.fromAdmin ? "NOBS AGENT" : "You"} · {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <form action={postApplicantMessage} className="mt-4 flex gap-2">
          <input type="hidden" name="token" value={token} />
          <input
            name="body"
            required
            placeholder="Ask a question or add anything..."
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

      <p className="mt-6 text-xs text-[var(--color-slate)]">
        Bookmark this page, it&apos;s your private link for this application. No login
        needed.
      </p>
    </div>
  );
}
