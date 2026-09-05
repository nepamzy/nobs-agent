const SIZE = 128;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function zoneColor(ratio: number) {
  if (ratio >= 0.8) return "var(--color-danger, #ef4444)";
  if (ratio >= 0.5) return "var(--color-warning, #eab308)";
  return "var(--color-brass)";
}

/**
 * Circular capacity meter: a ring that fills (and shifts brass -> yellow ->
 * red) as `count` approaches `capacity`, so the fill level itself carries
 * the same signal as the color.
 */
export function CapacityGauge({
  count,
  capacity,
  label,
}: {
  count: number;
  capacity: number;
  label: string;
}) {
  const ratio = Math.min(count / capacity, 1);
  const full = count >= capacity;
  const color = zoneColor(ratio);
  const offset = CIRCUMFERENCE * (1 - ratio);

  return (
    <div className="glass flex items-center gap-5 rounded-2xl p-6">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-[var(--color-line)]"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-[family-name:var(--font-display)] text-3xl font-semibold tabular-nums"
            style={{ color, transition: "color 0.6s ease" }}
          >
            {count}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-slate)]">
            / {capacity}
          </span>
        </div>
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-base font-medium">{label}</p>
        <p className="mt-1 text-sm text-[var(--color-slate)]">
          {full
            ? "All spots are filled. Not accepting new applications."
            : `${capacity - count} spot${capacity - count === 1 ? "" : "s"} remaining.`}
        </p>
      </div>
    </div>
  );
}
