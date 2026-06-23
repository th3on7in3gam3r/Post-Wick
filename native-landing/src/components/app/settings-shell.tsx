"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { SettingsNav } from "@/components/app/settings-nav";

export function SettingsShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <AppHeader title={title} description={description} />
      <SettingsNav pathname={pathname ?? "/settings"} />
      <div className="flex-1 space-y-6 p-6 md:p-8">{children}</div>
    </>
  );
}
