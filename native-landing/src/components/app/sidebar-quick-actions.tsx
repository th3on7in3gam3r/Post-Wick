"use client";

import Link from "next/link";
import { CalendarDays, ListChecks, Sparkles } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/queue", label: "Queue", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

export function SidebarQuickActions() {
  const { activeClient } = useActiveClient();

  if (!activeClient.id) return null;

  const brandHref = `/brands/${activeClient.id}`;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-cream/50">
        Quick actions
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {actions.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-1 py-2 text-center transition",
              "hover:border-white/20 hover:bg-white/15",
            )}
          >
            <Icon className="h-3.5 w-3.5 text-gold" />
            <span className="text-[0.65rem] font-medium text-cream">{label}</span>
          </Link>
        ))}
        <Link
          href={brandHref}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-1 py-2 text-center transition",
            "hover:border-white/20 hover:bg-white/15",
          )}
        >
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span className="text-[0.65rem] font-medium text-cream">Generate</span>
        </Link>
      </div>
    </div>
  );
}
