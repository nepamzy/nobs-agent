export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-24 pb-4 text-center">
      <p className="mb-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--color-brass)]">
        {eyebrow}
      </p>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-medium tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-[var(--color-slate)]">{description}</p>
      )}
    </div>
  );
}
