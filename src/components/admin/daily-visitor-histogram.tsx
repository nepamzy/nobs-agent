function toDayParam(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function DailyVisitorHistogram({
  data,
  selectedDay,
}: {
  data: { date: Date; label: string; count: number }[];
  selectedDay?: Date;
}) {
  const width = 800;
  const height = 240;
  const padding = 24;
  const leftAxisWidth = 32;
  const chartLeft = padding + leftAxisWidth;
  const max = Math.max(1, ...data.map((d) => d.count));

  const points = data.map((d, i) => {
    const x = chartLeft + (i / Math.max(1, data.length - 1)) * (width - chartLeft - padding);
    const y = height - padding - (d.count / max) * (height - padding * 2);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`;

  // Y-axis: four evenly spaced count values, rounded to whole numbers so
  // it never shows something odd like "3.4 visitors."
  const yAxisSteps = [1, 0.75, 0.5, 0.25, 0].map((f) => ({
    value: Math.round(max * f),
    y: padding + (1 - f) * (height - padding * 2),
  }));

  // X-axis: showing every single day would be unreadable over a full
  // month, so this spreads roughly 7-8 day-number labels evenly across
  // the whole range, always including the first and last day, rather
  // than only ever showing those two endpoints.
  const labelCount = Math.min(8, data.length);
  const labelIndices = Array.from({ length: labelCount }, (_, i) =>
    Math.round((i / (labelCount - 1)) * (data.length - 1))
  );
  const uniqueLabelIndices = Array.from(new Set(labelIndices));

  // Month name(s) spanned by this range, shown once (or twice if the
  // range crosses a month boundary) rather than repeated on every label.
  const monthNames = Array.from(
    new Set(data.map((d) => d.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })))
  );

  return (
    <div className="glass mt-8 rounded-2xl p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
        Daily visitors
      </h2>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        Unique visitors per day, {monthNames.join(" to ")}. Click a point to see who visited
        that day and which pages they looked at.
      </p>

      <div className="mt-6 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[600px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="visitorFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brass)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--color-brass)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {yAxisSteps.map((step) => (
            <g key={step.y}>
              <line
                x1={chartLeft}
                x2={width - padding}
                y1={step.y}
                y2={step.y}
                stroke="var(--color-line)"
                strokeWidth="1"
              />
              <text
                x={chartLeft - 8}
                y={step.y + 3}
                textAnchor="end"
                fontSize="10"
                fill="var(--color-slate)"
              >
                {step.value}
              </text>
            </g>
          ))}

          <path d={areaPath} fill="url(#visitorFill)" />
          <path d={linePath} fill="none" stroke="var(--color-brass)" strokeWidth="2" />

          {points.map((p) => {
            const isSelected = selectedDay && toDayParam(selectedDay) === toDayParam(p.date);
            return (
              <a
                key={p.date.toISOString()}
                href={`/admin/analytics?day=${toDayParam(p.date)}`}
                className="cursor-pointer"
              >
                {/* Generously-sized transparent hit area — the visible dot
                    below is too small on its own to comfortably click/tap. */}
                <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? "5" : "3"}
                  fill="var(--color-brass)"
                  stroke={isSelected ? "var(--color-paper)" : "none"}
                  strokeWidth="1.5"
                />
                <title>
                  {p.label}: {p.count} unique visitor{p.count === 1 ? "" : "s"} — click to see pages visited
                </title>
              </a>
            );
          })}

          {uniqueLabelIndices.map((i) => (
            <text
              key={i}
              x={points[i].x}
              y={height - padding + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--color-slate)"
            >
              {points[i].date.getDate()}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

export { DailyVisitorHistogram };
