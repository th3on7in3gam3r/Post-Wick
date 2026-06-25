"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { CalendarClient } from "@/components/app/calendar-client";
import { useClientFilteredPosts } from "@/components/app/client-scoped";
import { EmptyState } from "@/components/app/empty-state";
import { GenerateImagesButton } from "@/components/app/generate-images-button";
import { TextureButton } from "@/components/ui/texture-button";
import { useActiveClient } from "@/components/app/client-context";
import { postNeedsRepair } from "@/lib/posts/image-url";

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
  const repairCount = filteredPosts.filter((post) => postNeedsRepair(post.imageUrl)).length;

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

  return (
    <div className="space-y-4">
      {repairCount > 0 && activeClient.id ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-body">
            {repairCount} post{repairCount === 1 ? "" : "s"} still need images uploaded to
            production storage.
          </p>
          <GenerateImagesButton
            brandId={activeClient.id}
            missingCount={repairCount}
            label="Fix images"
          />
        </div>
      ) : null}
      <CalendarClient posts={filteredPosts} />
    </div>
  );
}
