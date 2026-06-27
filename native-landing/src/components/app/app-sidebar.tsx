import Link from "next/link";
import {
  BarChart3,
  Building2,
  CalendarDays,
  CreditCard,
  History,
  LayoutDashboard,
  ListChecks,
  Plug,
  Settings,
  Sparkles,
} from "lucide-react";
import { ClientSwitcher } from "@/components/app/client-switcher";
import { SidebarQuickActions } from "@/components/app/sidebar-quick-actions";
import { SidebarUpgradeNudge } from "@/components/app/sidebar-upgrade-nudge";
import { SidebarWelcome } from "@/components/app/sidebar-welcome";
import { BrandLogo } from "@/components/brand-logo";
import type { SubscriptionTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/onboarding", label: "Onboarding", icon: Sparkles, onboarding: true },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/queue", label: "Approval queue", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

function isActive(pathname: string, href: string, exact?: boolean, onboarding?: boolean) {
  if (onboarding) return pathname === "/onboarding";
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navItemsForUser(hasBrands: boolean) {
  return baseNavItems.map((item) =>
    item.onboarding
      ? { ...item, href: hasBrands ? "/onboarding?add=1" : "/onboarding" }
      : item,
  );
}

export function AppSidebar({
  pathname,
  plan,
  hasBrands,
  className,
  onNavigate,
}: {
  pathname: string;
  plan: {
    tier: SubscriptionTier;
    label: string;
    generateMax: number;
  };
  hasBrands: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  const navItems = navItemsForUser(hasBrands);
  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col border-r border-sage-dark/80 bg-sage text-cream",
        className,
      )}
    >
      <div className="shrink-0 space-y-4 border-b border-white/10 px-4 py-5">
        <div className="px-2">
          <BrandLogo href="/dashboard" variant="wordmark" tone="light" priority />
        </div>
        <SidebarWelcome hasBrands={hasBrands} />
        <ClientSwitcher tone="sidebar" />
        <SidebarQuickActions />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 pb-6">
        {navItems.map(({ href, label, icon: Icon, exact, onboarding }) => {
          const active = isActive(pathname, href, exact, onboarding);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-none transition-colors",
                active
                  ? "bg-cream/15 text-cream shadow-sm ring-1 ring-white/10"
                  : "text-cream/70 hover:bg-white/10 hover:text-cream",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-gold" : "text-cream/50")} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        {plan.tier === "free" ? (
          <SidebarUpgradeNudge generateMax={plan.generateMax} />
        ) : (
          <a
            href="mailto:hello@kerygmasocial.com"
            className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 transition hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-xs font-medium text-cream">Need help?</p>
            <p className="mt-0.5 text-xs text-cream/65">hello@kerygmasocial.com</p>
          </a>
        )}
      </div>
    </aside>
  );
}
