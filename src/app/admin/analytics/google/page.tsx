import { isGoogleAnalyticsConfigured, getGA4Summary, type GA4Summary } from "@/lib/google-analytics-data";

function formatSeconds(sec: number) {
  const minutes = Math.floor(sec / 60);
  const seconds = Math.round(sec % 60);
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass overflow-hidden rounded-2xl p-6">
      <p className="text-xs uppercase tracking-wider text-[var(--color-slate)]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-mono)] text-2xl text-[var(--color-brass)] sm:text-3xl">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-[var(--color-slate)]">{sub}</p>}
    </div>
  );
}

function RankedList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--color-slate)]">No data for this period yet.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate text-[var(--color-slate)]">{r.label}</span>
                <span className="shrink-0 font-[family-name:var(--font-mono)] text-[var(--color-brass)]">
                  {r.value.toLocaleString()}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-[var(--color-brass)]"
                  style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrendChart({ data }: { data: GA4Summary["dailyTrend"] }) {
  const width = 800;
  const height = 200;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.activeUsers));

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.activeUsers / max) * (height - padding * 2);
    return { x, y, ...d };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;

  return (
    <div className="glass mt-8 rounded-2xl p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
        Active users, last 30 days
      </h2>
      <div className="mt-6 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brass)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-brass)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#gaFill)" />
          <path d={linePath} fill="none" stroke="var(--color-brass)" strokeWidth="2" />
          {points.map((p) => (
            <circle key={p.date} cx={p.x} cy={p.y} r="2.5" fill="var(--color-brass)">
              <title>
                {p.date}: {p.activeUsers} active user{p.activeUsers === 1 ? "" : "s"}
              </title>
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SetupInstructions() {
  return (
    <div className="glass mt-6 rounded-2xl p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
        Not connected yet
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-slate)]">
        This pulls real numbers straight from your GA4 property using the Google Analytics Data
        API. It needs a Google Cloud service account with read access to your property — a
        one-time setup:
      </p>
      <ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 text-sm text-[var(--color-slate)]">
        <li>
          Go to{" "}
          <span className="text-[var(--color-paper)]">console.cloud.google.com</span>, create (or
          pick) a project, then enable the <span className="text-[var(--color-paper)]">Google
          Analytics Data API</span> for it.
        </li>
        <li>
          In that project, go to <span className="text-[var(--color-paper)]">IAM &amp; Admin →
          Service Accounts → Create service account</span>. Any name is fine — it only needs to
          read Analytics data.
        </li>
        <li>
          Open the new service account → <span className="text-[var(--color-paper)]">Keys → Add
          key → Create new key → JSON</span>. This downloads a JSON file — keep it private, it&apos;s
          a real credential.
        </li>
        <li>
          In <span className="text-[var(--color-paper)]">analytics.google.com</span>, go to{" "}
          <span className="text-[var(--color-paper)]">Admin → Property Access Management</span>{" "}
          (under the property, not the account) → add the service account&apos;s email (the
          <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-xs">client_email</code>
          field in that JSON file) as a <span className="text-[var(--color-paper)]">Viewer</span>.
        </li>
        <li>
          Send me: the property&apos;s numeric <span className="text-[var(--color-paper)]">Property
          ID</span> (Admin → Property details, not the G-XXXXXXXXXX Measurement ID), and the{" "}
          <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-xs">client_email</code> and{" "}
          <code className="mx-1 rounded bg-white/5 px-1.5 py-0.5 text-xs">private_key</code> fields
          from the JSON file.
        </li>
      </ol>
    </div>
  );
}

export default async function GoogleAnalyticsPage() {
  if (!isGoogleAnalyticsConfigured()) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Google Analytics
        </h1>
        <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
          Real GA4 numbers for your site, pulled directly from your Google Analytics property.
        </p>
        <SetupInstructions />
      </div>
    );
  }

  let data: GA4Summary | null = null;
  let error: string | null = null;
  try {
    data = await getGA4Summary();
  } catch (err) {
    error = err instanceof Error ? err.message : "Something went wrong.";
  }

  if (!data) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Google Analytics
        </h1>
        <div className="glass mt-6 rounded-xl p-4 text-sm text-red-400">
          Couldn&apos;t load Google Analytics data: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">
          Google Analytics
        </h1>
        <p className="text-sm text-[var(--color-slate)]">
          <span className="text-[var(--color-brass)]">{data.realtimeActiveUsers}</span> on the site
          right now
        </p>
      </div>
      <p className="mt-2 max-w-lg text-sm text-[var(--color-slate)]">
        Live from your GA4 property, last 28 days unless noted.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={data.activeUsers28d.toLocaleString()} sub="last 28 days" />
        <StatCard label="New users" value={data.newUsers28d.toLocaleString()} sub="last 28 days" />
        <StatCard label="Sessions" value={data.sessions28d.toLocaleString()} sub="last 28 days" />
        <StatCard label="Page views" value={data.pageViews28d.toLocaleString()} sub="last 28 days" />
        <StatCard
          label="Engaged sessions"
          value={data.engagedSessions28d.toLocaleString()}
          sub="last 28 days"
        />
        <StatCard label="Engagement rate" value={`${data.engagementRate28d.toFixed(1)}%`} />
        <StatCard
          label="Avg. engagement time"
          value={formatSeconds(data.avgEngagementTimeSec)}
          sub="per session"
        />
        <StatCard label="Right now" value={data.realtimeActiveUsers.toLocaleString()} sub="active users" />
      </div>

      <TrendChart data={data.dailyTrend} />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <RankedList
          title="Top pages"
          rows={data.topPages.map((p) => ({ label: p.path, value: p.views }))}
        />
        <RankedList
          title="Traffic channels"
          rows={data.channels.map((c) => ({ label: c.channel, value: c.sessions }))}
        />
        <RankedList
          title="Devices"
          rows={data.devices.map((d) => ({ label: d.device, value: d.users }))}
        />
        <RankedList
          title="Countries"
          rows={data.countries.map((c) => ({ label: c.country, value: c.users }))}
        />
      </div>
    </div>
  );
}
