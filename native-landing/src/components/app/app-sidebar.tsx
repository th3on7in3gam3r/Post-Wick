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

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-black/[0.08] bg-white/80 backdrop-blur-sm">
      <div className="shrink-0 border-b border-black/[0.06] px-6 py-5">
        <BrandLogo href="/dashboard" variant="wordmark" priority />
        <p className="mt-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gray-label">
          {SITE_TAGLINE}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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

      <div className="relative mx-4 mb-3 hidden shrink-0 overflow-hidden rounded-2xl border border-black/[0.06] shadow-sm md:block">
        <div
          className="h-36 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/sign-in-forest-hammock.png')" }}
          role="img"
          aria-label="Forest landscape with a hammock, matching the Post-Wick sign-in page"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/55 to-white/10" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3">
          <p className="font-playfair text-sm italic text-near-black/90">
            {SITE_TAGLINE}
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-black/[0.06] p-4">
        <a
          href="mailto:hello@postwick.com"
          className="text-xs text-gray-label hover:text-gold"
        >
          Questions? hello@postwick.com
        </a>
      </div>
    </aside>
  );
}
