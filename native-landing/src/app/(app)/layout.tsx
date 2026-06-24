"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return <AppShell pathname={pathname}>{children}</AppShell>;
}
