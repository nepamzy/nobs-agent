import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 100;

function normalize(q: string) {
  return q.toLowerCase().replace(/\s+/g, " ").replace(/[?!.]+$/g, "").trim();
}

type SearchParams = Promise<{ q?: string; show?: string }>;

export default async function AdminAssistantPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = "", show = "all" } = await searchParams;
  const query = q.trim();
  const onlyUnanswered = show === "unanswered";

  let total = 0;
  let lastWeek = 0;
  let unanswered = 0;
  let rows: Awaited<ReturnType<typeof prisma.assistantQuestion.findMany>> = [];
  let recent: { question: string }[] = [];
  let connected = true;

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    [total, lastWeek, unanswered, rows, recent] = await Promise.all([
      prisma.assistantQuestion.count(),
      prisma.assistantQuestion.count({ where: { createdAt: { gt: weekAgo } } }),
      prisma.assistantQuestion.count({ where: { answered: false } }),
      prisma.assistantQuestion.findMany({
        where: {
          ...(onlyUnanswered ? { answered: false } : {}),
          ...(query ? { question: { contains: query, mode: "insensitive" as const } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
      }),
      prisma.assistantQuestion.findMany({
        orderBy: { createdAt: "desc" },
        take: 1000,
        select: { question: true },
      }),
    ]);
  } catch {
    connected = false;
  }

  const counts = new Map<string, { text: string; count: number }>();
  for (const { question } of recent) {
    const key = normalize(question);
    if (!key) continue;
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { text: question.trim(), count: 1 });
  }
  const repeated = [...counts.values()]
    .filter((e) => e.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const tab = (value: string, label: string) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (value !== "all") params.set("show", value);
    const href = `/admin/assistant${params.toString() ? `?${params}` : ""}`;
    const active = show === value || (value === "all" && show !== "unanswered");
    return (
      <Link
        href={href}
        className={`rounded-full border px-3 py-1.5 text-xs transition ${
          active
            ? "border-[var(--color-brass)] bg-[var(--color-brass)]/10 text-[var(--color-brass)]"
            : "border-[var(--color-line)] text-[var(--color-slate)] hover:border-[var(--color-brass)]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">Assistant Questions</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-slate)]">
        What visitors actually ask the chat assistant on the website, newest first. Only the question and the
        reply are saved, never a name, email or IP address. &quot;Couldn&apos;t answer&quot; marks times it
        fell back to its apology message, which is a good hint of what to add to its answers.
      </p>

      {!connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to the database yet, so questions can&apos;t be shown.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total questions", total],
          ["Last 7 days", lastWeek],
          ["Couldn't answer", unanswered],
        ].map(([label, value]) => (
          <div key={label as string} className="glass rounded-xl p-5">
            <p className="font-[family-name:var(--font-mono)] text-3xl font-medium text-[var(--color-brass)]">{value}</p>
            <p className="mt-1 text-sm text-[var(--color-slate)]">{label}</p>
          </div>
        ))}
      </div>

      {repeated.length > 0 && (
        <div className="glass mt-6 rounded-xl p-5">
          <p className="text-sm font-medium">Asked more than once</p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-slate)]">
            {repeated.map((r) => (
              <li key={r.text} className="flex items-start justify-between gap-4">
                <span>{r.text}</span>
                <span className="shrink-0 rounded-full border border-[var(--color-line)] px-2 py-0.5 text-xs">
                  {r.count}×
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search questions..."
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-brass)]"
          />
        </div>
        {onlyUnanswered && <input type="hidden" name="show" value="unanswered" />}
        <button
          type="submit"
          className="rounded-full bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
        >
          Search
        </button>
        <div className="flex gap-2">
          {tab("all", "All")}
          {tab("unanswered", "Couldn't answer")}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {connected && rows.length === 0 && (
          <p className="text-sm text-[var(--color-slate)]">
            {total === 0
              ? "No questions yet. They will appear here as visitors use the chat assistant."
              : "No questions match that."}
          </p>
        )}
        {rows.map((r) => (
          <details key={r.id} className="glass rounded-xl p-5">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="max-w-3xl text-sm font-medium">{r.question}</p>
                <div className="flex shrink-0 items-center gap-2 text-xs text-[var(--color-slate)]">
                  {!r.answered && (
                    <span className="rounded-full border border-red-400/40 px-2 py-0.5 text-red-300">
                      Couldn&apos;t answer
                    </span>
                  )}
                  {r.turn > 1 && <span>follow-up #{r.turn}</span>}
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </summary>
            <p className="mt-4 whitespace-pre-wrap border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-slate)]">
              {r.answer ?? (r.answered ? "No reply was saved." : "The assistant could not answer this one.")}
            </p>
          </details>
        ))}
        {rows.length === PAGE_SIZE && (
          <p className="text-xs text-[var(--color-slate)]">Showing the newest {PAGE_SIZE}. Use search to narrow down.</p>
        )}
      </div>
    </div>
  );
}
