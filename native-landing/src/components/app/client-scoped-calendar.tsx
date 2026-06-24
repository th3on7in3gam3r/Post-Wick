"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { CalendarClient } from "@/components/app/calendar-client";
import { useClientFilteredPosts } from "@/components/app/client-scoped";
import { EmptyState } from "@/components/app/empty-state";
import { TextureButton } from "@/components/ui/texture-button";
import { useActiveClient } from "@/components/app/client-context";

type CalendarPostInput = {
  id: string;
  brandId: string;
  brandName: string;
  platform: string;
  content: string;
  caption: string;
  imageUrl: string | null;
  status: string;
  scheduledAt: string;
  externalPostId: string | null;
};

export function ClientScopedCalendar({ posts }: { posts: CalendarPostInput[] }) {
  const { activeClient } = useActiveClient();
  const filteredPosts = useClientFilteredPosts(posts);

  if (filteredPosts.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={`No scheduled posts for ${activeClient.name}`}
        description="Approve posts in your queue or switch to another client."
        action={
          <TextureButton asChild variant="primary" size="default">
            <Link href="/queue">Open approval queue</Link>
          </TextureButton>
        }
      />
    );
  }

  return <CalendarClient posts={filteredPosts} />;
}
