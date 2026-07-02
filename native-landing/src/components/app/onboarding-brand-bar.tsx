"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { ClientSwitcher } from "@/components/app/client-switcher";
import { useActiveClient } from "@/components/app/client-context";

export function OnboardingBrandBar() {
  const { clients } = useActiveClient();

  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-black/[0.06] bg-cream/50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gold" />
          <p className="text-sm font-medium text-near-black">My brands</p>
        </div>
        <Link
          href="/brands"
          className="text-xs font-medium text-gold transition hover:text-gold/80"
        >
          View all
        </Link>
      </div>
      <ClientSwitcher />
    </div>
  );
}
