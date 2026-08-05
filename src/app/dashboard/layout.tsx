import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { PushSubscribeButton } from "@/components/push-subscribe-button";
import { DashboardInbox } from "@/components/dashboard-inbox";
import {
  LayoutDashboard,
  FolderPlus,
  MessageSquare,
  CreditCard,
  Settings,
  Mail,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/dashboard/new-project", icon: FolderPlus },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { label: "Inquiries", href: "/dashboard/inquiries", icon: Mail },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

async function getUnreadNotifications(userId: string) {
  try {
    return await prisma.notification.findMany({
      where: { userId, readAt: null },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

async function getUnreadDirectMessageCount(userId: string) {
  try {
    return await prisma.message.count({ where: { recipientId: userId, readAt: null } });
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const notifications = await getUnreadNotifications(session.user.id);
  const unreadMessages = await getUnreadDirectMessageCount(session.user.id);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:flex-row md:gap-8">
      <aside className="w-full shrink-0 md:w-56">
        <p className="mb-1 font-[family-name:var(--font-display)] text-lg font-medium">
          {session.user.name ? session.user.name.split(" ")[0] : "Dashboard"}
        </p>
        <p className="mb-4 text-xs text-[var(--color-slate)] md:mb-6">{session.user.email}</p>
        <nav className="flex gap-1 overflow-x-auto pb-2 md:block md:space-y-1 md:overflow-visible md:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-[var(--color-slate)] transition hover:bg-white/5 hover:text-[var(--color-paper)] md:shrink md:whitespace-normal"
            >
              <item.icon size={16} />
              {item.label}
              {item.href === "/dashboard/messages" && unreadMessages > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                  {unreadMessages}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 border-t border-[var(--color-line)] pt-4 md:mt-8 md:flex-col md:items-start md:gap-2">
          <PushSubscribeButton />
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <DashboardInbox notifications={notifications} />
        {children}
      </div>
    </div>
  );
}
