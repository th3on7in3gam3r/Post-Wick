"use client";

import Link from "next/link";
import {
  CreditCard,
  Link2,
  Plug,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs: Array<{
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}> = [
  { href: "/settings", label: "General", icon: Settings2, exact: true },
  { href: "/settings/connections", label: "Connections", icon: Link2 },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="Settings sections"
      className="border-b border-black/[0.06] bg-white/50 px-6 md:px-8"
    >
      <div className="flex gap-1 overflow-x-auto py-3">
        {tabs.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-cream text-near-black shadow-sm"
                  : "text-gray-body hover:bg-cream/70 hover:text-near-black",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-gold" : "text-gray-label")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
