import Link from "next/link";
import { Bell, ArrowRight } from "lucide-react";
import { markNotificationRead } from "@/app/dashboard/actions";

type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  createdAt: Date;
};

export function DashboardInbox({ notifications }: { notifications: NotificationRow[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {notifications.map((n) => (
        <div key={n.id} className="glass flex items-start gap-3 rounded-xl border-[var(--color-brass)]/40 p-4">
          <Bell size={16} className="mt-0.5 shrink-0 text-[var(--color-brass)]" />
          <div className="flex-1">
            <p className="text-sm font-medium">{n.title}</p>
            {n.body && <p className="mt-1 text-sm text-[var(--color-slate)]">{n.body}</p>}
            <div className="mt-3 flex items-center gap-3">
              {n.link && (
                <Link
                  href={n.link}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brass)] px-4 py-1.5 text-xs font-medium text-[var(--color-ink)] transition hover:opacity-90"
                >
                  Continue <ArrowRight size={12} />
                </Link>
              )}
              <form action={markNotificationRead}>
                <input type="hidden" name="id" value={n.id} />
                <button
                  type="submit"
                  className="text-xs text-[var(--color-slate)] hover:text-[var(--color-paper)]"
                >
                  Dismiss
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
