import { Check, CheckCheck } from "lucide-react";

export function MessageTicks({
  deliveredAt,
  readAt,
}: {
  deliveredAt: Date | null;
  readAt: Date | null;
}) {
  if (readAt) {
    return <CheckCheck size={13} className="text-[var(--color-teal)]" aria-label="Seen" />;
  }
  if (deliveredAt) {
    return <CheckCheck size={13} className="text-[var(--color-slate)]" aria-label="Delivered" />;
  }
  return <Check size={13} className="text-[var(--color-slate)]" aria-label="Sent" />;
}
