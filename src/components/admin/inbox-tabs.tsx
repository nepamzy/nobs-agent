"use client";

import { useState } from "react";
import { MessageSquare, Mail, Briefcase } from "lucide-react";

export function InboxTabs({
  messages,
  inquiries,
  applications,
}: {
  messages: React.ReactNode;
  inquiries: React.ReactNode;
  applications: React.ReactNode;
}) {
  const [tab, setTab] = useState<"messages" | "inquiries" | "applications">("messages");

  const tabs = [
    { key: "messages" as const, label: "Client Messages", icon: MessageSquare },
    { key: "inquiries" as const, label: "Inquiries", icon: Mail },
    { key: "applications" as const, label: "Applications", icon: Briefcase },
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
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "messages" && messages}
        {tab === "inquiries" && inquiries}
        {tab === "applications" && applications}
      </div>
    </div>
  );
}
