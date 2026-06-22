"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/app/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar pathname={pathname} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
