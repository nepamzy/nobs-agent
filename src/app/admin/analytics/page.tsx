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
    <div className="glass rounded-2xl p-6">
      <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-mono)] text-3xl text-[var(--color-brass)]">
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

export default async function AdminAnalyticsPage() {
  const [data, dailyTrend] = await Promise.all([getAnalytics(), getDailyTrend(30)]);

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

      <DailyVisitorHistogram data={dailyTrend} />
    </div>
  );
}
