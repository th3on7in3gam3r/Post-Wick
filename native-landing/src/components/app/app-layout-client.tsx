"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ClientProvider } from "@/components/app/client-context";
import type { Client } from "@/lib/clients";

type AccountPlan = {
  label: string;
  generateMax: number;
};

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
      <AppShell pathname={pathname} plan={plan}>
        {children}
      </AppShell>
    </ClientProvider>
  );
}
