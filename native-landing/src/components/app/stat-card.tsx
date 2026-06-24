import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  valueVariant = "display",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  valueVariant?: "display" | "compact";
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-near-black",
              valueVariant === "compact"
                ? "text-base font-semibold capitalize sm:text-lg"
                : "font-playfair text-3xl italic",
            )}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-gray-body">{hint}</p> : null}
        </div>
        <div className="shrink-0 rounded-full bg-cream p-2.5">
          <Icon className="h-4 w-4 text-gold" />
        </div>
      </div>
    </div>
  );
}
