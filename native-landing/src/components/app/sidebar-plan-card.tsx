import Link from "next/link";
import { Sparkles } from "lucide-react";

export function SidebarPlanCard({
  plan,
}: {
  plan: {
    label: string;
    generateMax: number;
  };
}) {
  return (
    <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/12 via-gold/5 to-cream/60 px-3 py-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 shrink-0 rounded-full bg-white/80 p-1.5">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
            Your plan
          </p>
          <p className="mt-0.5 font-playfair text-lg italic leading-tight text-near-black">
            {plan.label}
          </p>
          <p className="mt-1 text-[0.65rem] leading-snug text-gray-body">
            Up to {plan.generateMax} posts per batch
          </p>
          <Link
            href="/settings/billing"
            className="mt-2 inline-flex text-xs font-medium text-gold transition hover:opacity-80"
          >
            Upgrade →
          </Link>
        </div>
      </div>
    </div>
  );
}
