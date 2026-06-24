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
import { BrandLogo } from "@/components/brand-logo";
import { SITE_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/onboarding", label: "Onboarding", icon: Sparkles },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/queue", label: "Approval queue", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings, exact: true },
  { href: "/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({
  pathname,
  className,
  onNavigate,
}: {
  pathname: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-screen w-64 shrink-0 flex-col border-r border-black/[0.08] bg-white/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="shrink-0 space-y-4 border-b border-black/[0.06] px-4 py-5">
        <div className="px-2">
          <BrandLogo href="/dashboard" variant="wordmark" priority />
          <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gray-label">
            {SITE_TAGLINE}
          </p>
        </div>
        <ClientSwitcher />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4 pb-6">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium leading-none transition-colors",
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
      </nav>

      <div className="shrink-0 border-t border-black/[0.06] p-4">
        <a
          href="mailto:hello@postwick.com"
          className="text-xs text-gray-label hover:text-gold"
        >
          Questions? hello@postwick.com
        </a>
        <div
          className="relative mt-3 hidden h-20 overflow-hidden rounded-xl border border-black/[0.06] md:block"
          aria-hidden
        >
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/sign-in-forest-hammock.png')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
        </div>
      </div>
    </aside>
  );
}
