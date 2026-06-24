"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { useClientFilteredPosts } from "@/components/app/client-scoped";
import { EmptyState } from "@/components/app/empty-state";
import { QueueClient } from "@/components/app/queue-client";
import { TextureButton } from "@/components/ui/texture-button";

type QueuePostInput = {
  id: string;
  brandId: string;
  brandName?: string;
  content: string;
  platform: string;
  imageUrl?: string | null;
};

export function ClientScopedQueue({ initialPosts }: { initialPosts: QueuePostInput[] }) {
  const { activeClient } = useActiveClient();
  const filteredPosts = useClientFilteredPosts(initialPosts);

  if (filteredPosts.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title={`No drafts for ${activeClient.name}`}
        description="Generate posts for this client or switch to another business."
        action={
          <TextureButton asChild variant="primary" size="default">
            <Link href="/brands">View brands</Link>
          </TextureButton>
        }
      />
    );
  }

  return <QueueClient initialPosts={filteredPosts} />;
}
