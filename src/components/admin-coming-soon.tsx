import type { LucideIcon } from "lucide-react";

export function AdminComingSoon({
  title,
  description,
  icon: Icon,
  nextStep,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  nextStep: string;
}) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-medium">{title}</h1>
      <div className="glass mt-6 flex flex-col items-start gap-3 rounded-2xl p-8">
        <Icon size={22} className="text-[var(--color-brass)]" />
        <p className="text-sm text-[var(--color-slate)]">{description}</p>
        <p className="text-xs text-[var(--color-slate)]/70">Next build step: {nextStep}</p>
      </div>
    </div>
  );
}
