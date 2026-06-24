"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/app/app-sidebar";
import { ClientSwitcher } from "@/components/app/client-switcher";
import type { SubscriptionTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  pathname,
  plan,
  hasBrands,
}: {
  children: React.ReactNode;
  pathname: string;
  plan: {
    tier: SubscriptionTier;
    label: string;
    generateMax: number;
  };
  hasBrands: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-cream">
      <AppSidebar pathname={pathname} plan={plan} hasBrands={hasBrands} className="hidden lg:flex" />

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AppSidebar
        pathname={pathname}
        plan={plan}
        hasBrands={hasBrands}
        onNavigate={() => setMobileOpen(false)}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[min(100%,18rem)] shadow-xl transition-transform duration-200 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-black/[0.06] bg-cream/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-near-black shadow-sm transition hover:bg-white/90"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <ClientSwitcher />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
