import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { ExternalPostLink } from "@/components/app/external-post-link";
import { cn } from "@/lib/utils";

type HistoryPost = {
  id: string;
  brandName: string;
  platform: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  publishError: string | null;
  externalPostId: string | null;
};

const statusStyles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export function HistoryList({ posts }: { posts: HistoryPost[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => {
        const timestamp = post.publishedAt ?? post.scheduledAt;
        return (
          <article
            key={post.id}
            className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                  {post.platform}
                </span>
                <span className="text-xs text-gray-label">{post.brandName}</span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-wide",
                  statusStyles[post.status] ?? "bg-cream text-gray-body",
                )}
              >
                {post.status}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-near-black">{post.content}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-label">
              <div className="flex flex-wrap items-center gap-3">
                {timestamp ? <span>{formatScheduleLabel(timestamp)}</span> : null}
                {post.status === "published" ? (
                  <ExternalPostLink
                    platform={post.platform}
                    externalPostId={post.externalPostId}
                    className="text-xs"
                  />
                ) : null}
              </div>
              {post.publishError ? (
                <span className="text-red-600">{post.publishError}</span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
