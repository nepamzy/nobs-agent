import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DailyVisitorHistogram } from "@/components/admin/daily-visitor-histogram";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

// YYYY-MM-DD in local time, for the ?day= URL param and the <input
// type="date"> value — deliberately not toISOString(), which shifts to
// UTC and can land on the wrong day for the visitor's own timezone.
function toDayParam(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDayParam(value: string | undefined, fallback: Date): Date {
  if (value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }
  return fallback;
}

async function uniqueVisitors(where: { createdAt?: { gte?: Date; lt?: Date } }) {
  const rows = await prisma.pageView.findMany({
    where: { ...where, visitorHash: { not: null } },
    distinct: ["visitorHash"],
    select: { id: true },
  });
  return rows.length;
}

async function getDailyTrend(days: number) {
  const today = startOfDay(new Date());
  const dayStarts: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dayStarts.push(d);
  }

  const counts = await Promise.all(
    dayStarts.map((start) => {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return uniqueVisitors({ createdAt: { gte: start, lt: end } });
    })
  );

  return dayStarts.map((d, i) => ({
    date: d,
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: counts[i],
  }));
}

// Who showed up on one specific day, and which pages they actually
// looked at that day — distinct from `topPaths`, which is an all-time
// aggregate and can't answer "what did people view on the 14th."
async function getDayBreakdown(day: Date) {
  const start = startOfDay(day);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const where = { createdAt: { gte: start, lt: end } };

  try {
    const [unique, pageViews, paths] = await Promise.all([
      uniqueVisitors(where),
      prisma.pageView.count({ where }),
      prisma.pageView.groupBy({
        by: ["path"],
        where,
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
      }),
    ]);
    return { unique, pageViews, paths };
  } catch {
    return { unique: 0, pageViews: 0, paths: [] as { path: string; _count: { path: number } }[] };
  }
}

async function getRevenueAndDuration() {
  try {
    const [payments, durationRows] = await Promise.all([
      prisma.bookingPayment.findMany({ select: { amount: true } }),
      prisma.pageView.findMany({
        where: { durationMs: { not: null } },
        select: { durationMs: true },
      }),
    ]);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDurationMs = durationRows.reduce((sum, r) => sum + (r.durationMs ?? 0), 0);
    const avgDurationMs = durationRows.length > 0 ? totalDurationMs / durationRows.length : 0;

    return { totalRevenue, totalDurationMs, avgDurationMs, sampledVisits: durationRows.length };
  } catch {
    return { totalRevenue: 0, totalDurationMs: 0, avgDurationMs: 0, sampledVisits: 0 };
  }
}

async function getAnalytics() {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const thisMonth = startOfMonth(now);
  const lastMonth = new Date(thisMonth);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const thisYear = startOfYear(now);
  const lastYear = new Date(thisYear);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  try {
    const [
      todayCount,
      yesterdayCount,
      thisMonthCount,
      lastMonthCount,
      thisYearCount,
      lastYearCount,
      allTimeCount,
      todayUnique,
      yesterdayUnique,
      thisMonthUnique,
      lastMonthUnique,
      thisYearUnique,
      lastYearUnique,
      allTimeUnique,
      topPaths,
    ] = await Promise.all([
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.pageView.count({ where: { createdAt: { gte: yesterday, lt: today } } }),
      prisma.pageView.count({ where: { createdAt: { gte: thisMonth } } }),
      prisma.pageView.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
      prisma.pageView.count({ where: { createdAt: { gte: thisYear } } }),
      prisma.pageView.count({ where: { createdAt: { gte: lastYear, lt: thisYear } } }),
      prisma.pageView.count(),
      uniqueVisitors({ createdAt: { gte: today } }),
      uniqueVisitors({ createdAt: { gte: yesterday, lt: today } }),
      uniqueVisitors({ createdAt: { gte: thisMonth } }),
      uniqueVisitors({ createdAt: { gte: lastMonth, lt: thisMonth } }),
      uniqueVisitors({ createdAt: { gte: thisYear } }),
      uniqueVisitors({ createdAt: { gte: lastYear, lt: thisYear } }),
      uniqueVisitors({}),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 8,
      }),
    ]);

    return {
      connected: true,
      todayCount,
      yesterdayCount,
      thisMonthCount,
      lastMonthCount,
      thisYearCount,
      lastYearCount,
      allTimeCount,
      todayUnique,
      yesterdayUnique,
      thisMonthUnique,
      lastMonthUnique,
      thisYearUnique,
      lastYearUnique,
      allTimeUnique,
      topPaths,
    };
  } catch {
    return {
      connected: false,
      todayCount: 0,
      yesterdayCount: 0,
      thisMonthCount: 0,
      lastMonthCount: 0,
      thisYearCount: 0,
      lastYearCount: 0,
      allTimeCount: 0,
      todayUnique: 0,
      yesterdayUnique: 0,
      thisMonthUnique: 0,
      lastMonthUnique: 0,
      thisYearUnique: 0,
      lastYearUnique: 0,
      allTimeUnique: 0,
      topPaths: [] as { path: string; _count: { path: number } }[],
    };
  }
}

function growthPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function GrowthBadge({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-slate)]">
        <Minus size={12} /> No prior data
      </span>
    );
  }
  const up = percent >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${up ? "text-emerald-400" : "text-red-400"}`}
    >
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? "+" : ""}
      {percent}%
    </span>
  );
}

function StatCard({
  label,
  value,
  uniqueValue,
  compareLabel,
  growth,
}: {
  label: string;
  value: number;
  uniqueValue: number;
  compareLabel?: string;
  growth?: number | null;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl p-6">
      <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
        {uniqueValue.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-[var(--color-slate)]">
        unique visitors, {value.toLocaleString()} page views
      </p>
      {compareLabel && growth !== undefined && (
        <p className="mt-2 text-xs text-[var(--color-slate)]">
          vs {compareLabel} <GrowthBadge percent={growth} />
        </p>
      )}
    </div>
  );
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  const seconds = totalSeconds % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day: dayParam } = await searchParams;
  const selectedDay = parseDayParam(dayParam, startOfDay(new Date()));

  const [data, dailyTrend, revenueData, dayBreakdown] = await Promise.all([
    getAnalytics(),
    getDailyTrend(30),
    getRevenueAndDuration(),
    getDayBreakdown(selectedDay),
  ]);

  const monthGrowth = growthPercent(data.thisMonthUnique, data.lastMonthUnique);
  const yearGrowth = growthPercent(data.thisYearUnique, data.lastYearUnique);
  const dayGrowth = growthPercent(data.todayUnique, data.yesterdayUnique);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
        Analytics
      </h1>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Real visits to your public pages, admin and dashboard activity aren&apos;t
        counted. Each number is unique visitors, not raw page loads, so someone
        refreshing or browsing several pages only counts once.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass overflow-hidden rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">
            Total page views
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
            {data.allTimeCount.toLocaleString()}
          </p>
        </div>
        <div className="glass overflow-hidden rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">
            Total time on site
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
            {formatDuration(revenueData.totalDurationMs)}
          </p>
          <p className="mt-1 text-xs text-[var(--color-slate)]">
            avg {formatDuration(revenueData.avgDurationMs)} per visit
          </p>
        </div>
        <div className="glass overflow-hidden rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">
            Total revenue
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
            {formatNaira(revenueData.totalRevenue)}
          </p>
        </div>
        <div className="glass overflow-hidden rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">
            All-time unique visitors
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
            {data.allTimeUnique.toLocaleString()}
          </p>
        </div>
      </div>

      {!data.connected && (
        <div className="glass mt-6 rounded-xl p-4 text-sm text-[var(--color-slate)]">
          Not connected to a database yet.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Today"
          value={data.todayCount}
          uniqueValue={data.todayUnique}
          compareLabel="yesterday"
          growth={dayGrowth}
        />
        <StatCard label="Yesterday" value={data.yesterdayCount} uniqueValue={data.yesterdayUnique} />
        <StatCard label="All time" value={data.allTimeCount} uniqueValue={data.allTimeUnique} />
        <StatCard
          label="This month"
          value={data.thisMonthCount}
          uniqueValue={data.thisMonthUnique}
          compareLabel="last month"
          growth={monthGrowth}
        />
        <StatCard label="Last month" value={data.lastMonthCount} uniqueValue={data.lastMonthUnique} />
        <StatCard
          label="This year"
          value={data.thisYearCount}
          uniqueValue={data.thisYearUnique}
          compareLabel="last year"
          growth={yearGrowth}
        />
        <StatCard label="Last year" value={data.lastYearCount} uniqueValue={data.lastYearUnique} />
      </div>

      {data.topPaths.length > 0 && (
        <div className="glass mt-8 rounded-2xl p-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">
            Most visited pages
          </h2>
          <div className="space-y-2">
            {data.topPaths.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-[var(--color-slate)]">{p.path}</span>
                <span className="font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
                  {p._count.path.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DailyVisitorHistogram data={dailyTrend} selectedDay={selectedDay} />

      <div className="glass mt-8 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
              Visitors by day
            </h2>
            <p className="mt-1 text-sm text-[var(--color-slate)]">
              Who showed up on {selectedDay.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}, and exactly which pages they looked at.
            </p>
          </div>

          <form action="/admin/analytics" method="GET" className="flex items-center gap-2">
            <input
              type="date"
              name="day"
              defaultValue={toDayParam(selectedDay)}
              max={toDayParam(new Date())}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-brass)]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--color-brass)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:opacity-90"
            >
              View
            </button>
          </form>
        </div>

        <div className="mt-2 flex gap-3 text-xs">
          <Link href="/admin/analytics" className="text-[var(--color-brass)] hover:underline">
            Today
          </Link>
          <Link
            href={`/admin/analytics?day=${toDayParam(
              new Date(new Date().setDate(new Date().getDate() - 1))
            )}`}
            className="text-[var(--color-brass)] hover:underline"
          >
            Yesterday
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass overflow-hidden rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">
              Unique visitors that day
            </p>
            <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
              {dayBreakdown.unique.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-[var(--color-slate)]">
              {dayBreakdown.pageViews.toLocaleString()} total page views
            </p>
          </div>

          <div className="glass overflow-hidden rounded-xl p-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-[var(--color-slate)]">
              Pages visited that day
            </p>
            {dayBreakdown.paths.length === 0 ? (
              <p className="text-sm text-[var(--color-slate)]">No visits recorded that day.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {dayBreakdown.paths.map((p) => (
                  <div key={p.path} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-[var(--color-slate)]">{p.path}</span>
                    <span className="shrink-0 font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
                      {p._count.path.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
