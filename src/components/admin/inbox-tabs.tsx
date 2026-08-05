"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Mail, Briefcase, CalendarClock, Search, ArrowUpRight } from "lucide-react";

const inputClass =
  "rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]";

type Thread = { userId: string; name: string; email: string; lastMessage: string; unread: number };
type Inquiry = { id: string; name: string; message: string };
type Application = { id: string; name: string; jobTitle: string; unread: number };
type BookingRow = { id: string; fullName: string; serviceInterest: string; scheduledFor: Date };

function SearchBox({
  query,
  setQuery,
  placeholder,
}: {
  query: string;
  setQuery: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative mb-4">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} w-full pl-9`}
      />
    </div>
  );
}

export function InboxTabs({
  threads,
  inquiries,
  applications,
  bookings,
}: {
  threads: Thread[];
  inquiries: Inquiry[];
  applications: Application[];
  bookings: BookingRow[];
}) {
  const [tab, setTab] = useState<"messages" | "bookings" | "inquiries" | "applications">("messages");
  const [messagesQuery, setMessagesQuery] = useState("");
  const [inquiriesQuery, setInquiriesQuery] = useState("");
  const [applicationsQuery, setApplicationsQuery] = useState("");
  const [bookingsQuery, setBookingsQuery] = useState("");

  const filteredThreads = threads.filter((t) =>
    `${t.name} ${t.email} ${t.lastMessage}`.toLowerCase().includes(messagesQuery.toLowerCase())
  );
  const filteredInquiries = inquiries.filter((i) =>
    `${i.name} ${i.message}`.toLowerCase().includes(inquiriesQuery.toLowerCase())
  );
  const filteredApplications = applications.filter((a) =>
    `${a.name} ${a.jobTitle}`.toLowerCase().includes(applicationsQuery.toLowerCase())
  );
  const filteredBookings = bookings.filter((b) =>
    `${b.fullName} ${b.serviceInterest}`.toLowerCase().includes(bookingsQuery.toLowerCase())
  );

  const tabs = [
    { key: "messages" as const, label: "Client Messages", icon: MessageSquare, count: 0 },
    { key: "bookings" as const, label: "Bookings", icon: CalendarClock, count: bookings.length },
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
        {tab === "messages" && (
          <div>
            <SearchBox
              query={messagesQuery}
              setQuery={setMessagesQuery}
              placeholder="Search messages by client name, email, or content..."
            />
            <div className="space-y-2">
              {filteredThreads.length === 0 && (
                <p className="text-sm text-[var(--color-slate)]">
                  {threads.length === 0 ? "No client messages yet." : "No messages match that search."}
                </p>
              )}
              {filteredThreads.map((t) => (
                <Link
                  key={t.userId}
                  href={`/admin/messages/${t.userId}`}
                  className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-[var(--color-slate)]">
                      {t.lastMessage.slice(0, 70)}
                      {t.lastMessage.length > 70 ? "..." : ""}
                    </p>
                  </div>
                  {t.unread > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                      {t.unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "bookings" && (
          <div>
            <SearchBox
              query={bookingsQuery}
              setQuery={setBookingsQuery}
              placeholder="Search bookings by name or service..."
            />
            <div className="space-y-2">
              {filteredBookings.length === 0 && (
                <p className="text-sm text-[var(--color-slate)]">
                  {bookings.length === 0 ? "No new booking requests." : "No bookings match that search."}
                </p>
              )}
              {filteredBookings.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div>
                    <p className="font-medium">{b.fullName}</p>
                    <p className="text-xs text-[var(--color-slate)]">
                      {b.serviceInterest} · {new Date(b.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <CalendarClock size={16} className="shrink-0 text-[var(--color-slate)]" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "inquiries" && (
          <div>
            <SearchBox
              query={inquiriesQuery}
              setQuery={setInquiriesQuery}
              placeholder="Search inquiries by name or message..."
            />
            <div className="space-y-2">
              {filteredInquiries.length === 0 && (
                <p className="text-sm text-[var(--color-slate)]">
                  {inquiries.length === 0 ? "No unhandled inquiries." : "No inquiries match that search."}
                </p>
              )}
              {filteredInquiries.map((inq) => (
                <Link
                  key={inq.id}
                  href={`/admin/inquiries/${inq.id}`}
                  className="glass group flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div>
                    <p className="font-medium">{inq.name}</p>
                    <p className="text-xs text-[var(--color-slate)]">
                      {inq.message.slice(0, 70)}
                      {inq.message.length > 70 ? "..." : ""}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-[var(--color-slate)] transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--color-brass)]"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div>
            <SearchBox
              query={applicationsQuery}
              setQuery={setApplicationsQuery}
              placeholder="Search applicants by name or job title..."
            />
            <div className="space-y-2">
              {filteredApplications.length === 0 && (
                <p className="text-sm text-[var(--color-slate)]">
                  {applications.length === 0 ? "No applications yet." : "No applicants match that search."}
                </p>
              )}
              {filteredApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/admin/careers/applications/${app.id}`}
                  className="glass group relative flex items-center justify-between gap-4 rounded-xl p-4 transition hover:border-[var(--color-brass)]/50"
                >
                  <div>
                    <p className="font-medium">{app.name}</p>
                    <p className="text-xs text-[var(--color-slate)]">{app.jobTitle}</p>
                  </div>
                  {app.unread > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-brass)] text-[10px] font-bold text-[var(--color-ink)]">
                      {app.unread}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
