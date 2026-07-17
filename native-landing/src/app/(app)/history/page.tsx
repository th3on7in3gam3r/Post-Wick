import Link from "next/link";
import { History } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { EmptyState } from "@/components/app/empty-state";
import { HistoryList } from "@/components/app/history-list";
import { TextureButton } from "@/components/ui/texture-button";
import { getPostHistory } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "failed", label: "Failed" },
] as const;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  const userId = await requireUserId();
  const filter =
    searchParams.filter === "published" || searchParams.filter === "failed"
      ? searchParams.filter
      : "all";
  const posts = await getPostHistory(userId, filter);

  return (
    <>
      <AppHeader
        title="Publishing history"
        description="Every post autopilot has published or attempted to publish."
      />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <Link
              key={item.id}
              href={item.id === "all" ? "/history" : `/history?filter=${item.id}`}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === item.id
                  ? "border-gold/40 bg-cream text-near-black"
                  : "border-black/[0.08] bg-white text-gray-body hover:text-near-black",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            icon={History}
            title="No publishing history yet"
            description="Once posts go live, they will appear here with timestamps and status."
            action={
              <TextureButton asChild variant="primary" size="default">
                <Link href="/calendar">View calendar</Link>
              </TextureButton>
            }
          />
        ) : (
          <HistoryList
            showRetryAll={filter === "failed"}
            posts={posts.map((post) => ({
              id: post.id,
              brandName: post.brandName,
              platform: post.platform,
              content: post.content,
              status: post.status,
              scheduledAt: post.scheduledAt,
              publishedAt: post.publishedAt,
              publishError: post.publishError,
              externalPostId: post.externalPostId,
              isPublic: post.isPublic,
            }))}
          />
        )}
      </div>
    </>
  );
}
