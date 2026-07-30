function DailyVisitorHistogram({
  data,
}: {
  data: { date: Date; label: string; count: number }[];
}) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="glass mt-8 rounded-2xl p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-medium">
        Daily visitors
      </h2>
      <p className="mt-1 text-sm text-[var(--color-slate)]">
        Unique visitors per day, last {data.length} days.
      </p>

      <div className="mt-6 flex h-48 items-end gap-1 overflow-x-auto pb-2">
        {data.map((d) => {
          const heightPercent = (d.count / max) * 100;
          return (
            <div
              key={d.date.toISOString()}
              className="group relative flex min-w-[10px] flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded bg-[var(--color-ink)] px-2 py-1 text-[10px] text-[var(--color-paper)] shadow-lg group-hover:block">
                {d.label}: {d.count}
              </div>
              <div
                className="w-full rounded-t bg-[var(--color-brass)] transition-all group-hover:opacity-80"
                style={{ height: `${Math.max(heightPercent, d.count > 0 ? 3 : 0.5)}%` }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-[var(--color-slate)]">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

export { DailyVisitorHistogram };
