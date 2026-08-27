import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";
import { PushSubscribeButton } from "@/components/push-subscribe-button";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Newspaper,
  Users,
  Mail,
  CreditCard,
  CalendarClock,
  Briefcase,
  BarChart3,
  UserCircle,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Site Content", href: "/admin/content", icon: FileText },
  { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
  { label: "Founder Profile", href: "/admin/founder", icon: UserCircle },
  { label: "Blog", href: "/admin/blog", icon: Newspaper },
  { label: "Clients", href: "/admin/clients", icon: Users },
  { label: "Careers", href: "/admin/careers", icon: Briefcase },
  { label: "Inbox", href: "/admin/inbox", icon: Mail },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarClock },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

async function getUnreadInboxCount() {
  try {
    const [messages, inquiries, applications] = await Promise.all([
      prisma.message.count({ where: { projectId: null, recipientId: null, readAt: null } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.jobMessage.count({ where: { fromAdmin: false, readByAdmin: false } }),
    ]);
    return messages + inquiries + applications;
  } catch {
    return 0;
  }
}

async function getPendingBookingCount() {
  try {
    return await prisma.booking.count({ where: { status: "PENDING" } });
  } catch {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware already blocks this route for the wrong
  // role, but a server-side check here means the layout is safe even if
  // middleware config ever drifts from route structure.
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    redirect("/login?callbackUrl=/admin");
  }

  const unreadInbox = await getUnreadInboxCount();
  const pendingBookings = await getPendingBookingCount();

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 md:flex-row md:gap-8">
      <aside className="w-full shrink-0 md:w-56">
        <p className="mb-1 font-[family-name:var(--font-display)] text-lg font-medium">
          Admin
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
              {item.href === "/admin/inbox" && unreadInbox > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                  {unreadInbox}
                </span>
              )}
              {item.href === "/admin/bookings" && pendingBookings > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                  {pendingBookings}
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
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
