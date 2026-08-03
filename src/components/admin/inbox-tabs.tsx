"use client";

import { useState } from "react";
import { MessageSquare, Mail, Briefcase, CalendarClock } from "lucide-react";

export function InboxTabs({
  messages,
  inquiries,
  applications,
  bookings,
  bookingsCount,
}: {
  messages: React.ReactNode;
  inquiries: React.ReactNode;
  applications: React.ReactNode;
  bookings: React.ReactNode;
  bookingsCount: number;
}) {
  const [tab, setTab] = useState<"messages" | "inquiries" | "applications" | "bookings">(
    "messages"
  );

  const tabs = [
    { key: "messages" as const, label: "Client Messages", icon: MessageSquare, count: 0 },
    { key: "bookings" as const, label: "Bookings", icon: CalendarClock, count: bookingsCount },
    { key: "inquiries" as const, label: "Inquiries", icon: Mail, count: 0 },
    { key: "applications" as const, label: "Applications", icon: Briefcase, count: 0 },
  ];

  return (
    <div>
      <div className="flex gap-2 border-b border-[var(--color-line)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition ${
              tab === t.key
                ? "border-[var(--color-brass)] text-[var(--color-brass)]"
                : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-paper)]"
            }`}
          >
            <t.icon size={15} />
            {t.label}
            {t.count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "messages" && messages}
        {tab === "bookings" && bookings}
        {tab === "inquiries" && inquiries}
        {tab === "applications" && applications}
      </div>
    </div>
  );
}
