import Link from "next/link";
import { ListChecks } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { EmptyState } from "@/components/app/empty-state";
import { QueueClient } from "@/components/app/queue-client";
import { TextureButton } from "@/components/ui/texture-button";
import { getBrandsByUserId, getPendingPostsByUserId } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const userId = await requireUserId();
  const [pendingPosts, brands] = await Promise.all([
    getPendingPostsByUserId(userId),
    getBrandsByUserId(userId),
  ]);

  return (
    <>
      <AppHeader
        title="Approval queue"
        description="Swipe through AI drafts and approve what feels right."
      />
      <div className="flex flex-1 flex-col p-6 md:p-8">
        {pendingPosts.length > 0 ? (
          <QueueClient initialPosts={pendingPosts} />
        ) : (
          <EmptyState
            icon={ListChecks}
            title="Queue is empty"
            description={
              brands.length > 0
                ? "All current drafts are reviewed. Add another brand or regenerate posts later."
                : "Set up your brand first and we will generate posts to review here."
            }
            action={
              <TextureButton asChild variant="primary" size="default">
                <Link href={brands.length > 0 ? "/brands" : "/onboarding"}>
                  {brands.length > 0 ? "View brands" : "Set up your brand"}
                </Link>
              </TextureButton>
            }
          />
        )}
      </div>
    </>
  );
}
