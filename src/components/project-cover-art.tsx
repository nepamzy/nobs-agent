// Generates a distinct, on-brand cover for each project from its slug,
// avoids broken <img> tags before real photography/screenshots exist.
// Swap for MediaAsset.url once real project images are uploaded.

const PALETTES = [
  ["#1b1f2a", "#e4b343"],
  ["#12151d", "#3ed6c4"],
  ["#1b1f2a", "#3ed6c4"],
  ["#12151d", "#e4b343"],
];

function hashSlug(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

export function ProjectCoverArt({
  slug,
  industry,
  className = "",
}: {
  slug: string;
  industry: string;
  className?: string;
}) {
  const h = hashSlug(slug);
  const [base, accent] = PALETTES[h % PALETTES.length];
  const offset = (h % 40) - 20;

  return (
    <div
      className={`relative flex items-end overflow-hidden rounded-2xl border border-[var(--color-line)] ${className}`}
      style={{ background: base }}
    >
      <svg
        viewBox="0 0 400 260"
        className="absolute inset-0 h-full w-full opacity-70"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`grad-${slug}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={base} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="400" height="260" fill={`url(#grad-${slug})`} />
        <g stroke={accent} strokeOpacity="0.25" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="260" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} />
          ))}
        </g>
        <polygon
          points={`${200 + offset},60 260,110 240,180 160,180 140,110`}
          fill={accent}
          fillOpacity="0.85"
        />
      </svg>
      <span className="relative z-10 px-4 py-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-paper)]/80">
        {industry}
      </span>
    </div>
  );
}
