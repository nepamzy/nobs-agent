function DailyVisitorHistogram({
  data,
}: {
  data: { date: Date; label: string; count: number }[];
}) {
  const width = 800;
  const height = 220;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.count));

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;

  return (
    <div className="glass mt-8 rounded-2xl p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
        Daily visitors
      </h2>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        Unique visitors per day, last {data.length} days.
      </p>

      <div className="mt-6 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brass)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-brass)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={padding}
              x2={width - padding}
              y1={padding + f * (height - padding * 2)}
              y2={padding + f * (height - padding * 2)}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
          ))}

          <path d={areaPath} fill="url(#visitorFill)" />
          <path d={linePath} fill="none" stroke="var(--color-brass)" strokeWidth="2" />

          {points.map((p) => (
            <g key={p.date.toISOString()}>
              <circle cx={p.x} cy={p.y} r="3" fill="var(--color-brass)" />
              <title>
                {p.label}: {p.count} unique visitor{p.count === 1 ? "" : "s"}
              </title>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-[var(--color-slate)]">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export { DailyVisitorHistogram };
