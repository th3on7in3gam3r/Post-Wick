"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ClientProvider } from "@/components/app/client-context";
import type { Client } from "@/lib/clients";

import type { AccountPlan } from "@/lib/server/account-plan";

export function AppLayoutClient({
  clients,
  plan,
  children,
}: {
  clients: Client[];
  plan: AccountPlan;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ClientProvider clients={clients}>
      <AppShell pathname={pathname} plan={plan} hasBrands={clients.length > 0}>
        {children}
      </AppShell>
    </ClientProvider>
  );
}
