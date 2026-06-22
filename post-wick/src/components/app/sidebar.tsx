import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  Settings,
  CreditCard,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/brands", label: "Brands", icon: Building2 },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/settings/billing", label: "Billing", icon: CreditCard },
  { href: "/settings/connections", label: "Connections", icon: Link2 },
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex w-64 flex-col border-r border-brand-border bg-brand-surface">
      <div className="border-b border-brand-border p-6">
        <Link href="/dashboard" className="font-serif text-xl italic">
          Post-Wick
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-brand-accent-muted text-brand-accent"
                : "text-brand-muted hover:bg-brand-border/50 hover:text-brand-text",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
