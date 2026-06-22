"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar pathname={pathname} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
