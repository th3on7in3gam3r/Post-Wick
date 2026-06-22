import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            {label}
          </p>
          <p className="mt-2 font-playfair text-3xl italic text-near-black">{value}</p>
          {hint ? <p className="mt-1 text-xs text-gray-body">{hint}</p> : null}
        </div>
        <div className="rounded-full bg-cream p-2.5">
          <Icon className="h-4 w-4 text-gold" />
        </div>
      </div>
    </div>
  );
}
