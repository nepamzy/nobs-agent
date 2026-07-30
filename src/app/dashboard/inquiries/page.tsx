import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { postClientInquiryReply } from "./actions";
import { CheckCircle2, Clock } from "lucide-react";

async function getMyInquiries(email: string) {
  try {
    return await prisma.contactMessage.findMany({
      where: { email },
      orderBy: { createdAt: "desc" },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });
  } catch {
    return [];
  }
}

export default async function DashboardInquiriesPage() {
  const session = await auth();
  const inquiries = await getMyInquiries(session!.user.email!);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Inquiries
      </h1>
      <p className="mt-2 text-sm text-[var(--color-slate)]">
        Anything you&apos;ve sent through the contact form, and where it stands.
      </p>

      {inquiries.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-slate)]">
          Nothing on file yet. Inquiries sent from the contact form using this email
          show up here.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--color-slate)]">
                  {new Date(inq.createdAt).toLocaleDateString()}
                </p>
                {inq.handled ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 size={13} /> Handled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-brass)]">
                    <Clock size={13} /> Awaiting response
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm">{inq.message}</p>

              {inq.replies.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-[var(--color-line)] pt-4">
                  {inq.replies.map((r: { id: string; fromAdmin: boolean; body: string; createdAt: Date }) => (
                    <div
                      key={r.id}
                      className={`max-w-[85%] rounded-lg p-3 text-sm ${
                        r.fromAdmin ? "bg-white/5" : "ml-auto border border-[var(--color-brass)]/30 bg-[var(--color-brass)]/10"
                      }`}
                    >
                      <p>{r.body}</p>
                      <p className="mt-1 text-[10px] text-[var(--color-slate)]">
                        {r.fromAdmin ? "NOBS AGENT" : "You"}, {new Date(r.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <form action={postClientInquiryReply} className="mt-4 flex gap-2">
                <input type="hidden" name="contactMessageId" value={inq.id} />
                <input
                  name="body"
                  required
                  placeholder="Reply..."
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
                >
                  Send
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
