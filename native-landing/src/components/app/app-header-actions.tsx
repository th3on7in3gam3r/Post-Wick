"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import type { ReactNode } from "react";
import { useActiveClient } from "@/components/app/client-context";
import { TextureButton } from "@/components/ui/texture-button";

export function AppHeaderActions({ action }: { action?: ReactNode }) {
  const { activeClient } = useActiveClient();

  return (
    <div className="flex shrink-0 items-center gap-3">
      {action}
      <TextureButton asChild variant="primary" size="sm">
        <Link href={activeClient.id ? `/brands/${activeClient.id}` : "/brands"}>
          Generate posts →
        </Link>
      </TextureButton>
      <Link
        href="/queue"
        className="rounded-full p-2 text-gray-label transition hover:bg-black/5"
        aria-label="Open approval queue"
      >
        <Bell className="h-5 w-5" />
      </Link>
      <UserButton
        afterSignOutUrl="/sign-in"
        appearance={{
          elements: {
            avatarBox: "h-9 w-9",
          },
        }}
      />
    </div>
  );
}
