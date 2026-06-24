"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { ClientProvider } from "@/components/app/client-context";
import type { Client } from "@/lib/clients";

export function AppLayoutClient({
  clients,
  children,
}: {
  clients: Client[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ClientProvider clients={clients}>
      <AppShell pathname={pathname}>{children}</AppShell>
    </ClientProvider>
  );
}
