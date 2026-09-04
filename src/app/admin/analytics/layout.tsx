"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Overview", href: "/admin/analytics" },
  { label: "Google Analytics", href: "/admin/analytics/google" },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-[var(--color-line)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
                active
                  ? "border-[var(--color-brass)] text-[var(--color-brass)]"
                  : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-paper)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
