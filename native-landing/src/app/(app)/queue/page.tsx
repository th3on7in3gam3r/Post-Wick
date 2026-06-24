import Link from "next/link";
import { ListChecks } from "lucide-react";
import { AppHeaderWithClient } from "@/components/app/client-scoped";
import { ClientScopedQueue } from "@/components/app/client-scoped-queue";
import { EmptyState } from "@/components/app/empty-state";
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
      <AppHeaderWithClient
        title="Approval queue"
        description="review AI drafts, refine in plain words, and approve"
      />
      <div className="flex flex-1 flex-col p-6 md:p-8">
        {pendingPosts.length > 0 ? (
          <ClientScopedQueue initialPosts={pendingPosts} />
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
                <Link href={brands.length > 0 ? "/onboarding?add=1" : "/onboarding"}>
                  {brands.length > 0 ? "Add new client +" : "Set up your brand"}
                </Link>
              </TextureButton>
            }
          />
        )}
      </div>
    </>
  );
}
