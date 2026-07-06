"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { ExternalPostLink } from "@/components/app/external-post-link";
import { TextureButton } from "@/components/ui/texture-button";
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

export function HistoryList({
  posts,
  showRetryAll = false,
}: {
  posts: HistoryPost[];
  showRetryAll?: boolean;
}) {
  const router = useRouter();
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryingAll, setRetryingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const failedCount = posts.filter((post) => post.status === "failed").length;

  async function retryPost(postId: string) {
    setRetryingId(postId);
    setActionError(null);

    try {
      const response = await fetch(`/api/posts/${postId}/retry`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => ({}))) as {
        status?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not retry this post",
        );
      }

      if (data.status === "failed" && data.error) {
        setActionError(data.error);
      }

      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not retry this post",
      );
    } finally {
      setRetryingId(null);
    }
  }

  async function retryAllFailed() {
    setRetryingAll(true);
    setActionError(null);

    try {
      const response = await fetch("/api/posts/retry-failed", {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        failed?: number;
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not retry failed posts",
        );
      }

      if (data.failed && data.failed > 0) {
        setActionError(
          `${data.failed} post${data.failed === 1 ? "" : "s"} still failed. Check the error on each card and try again.`,
        );
      }

      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not retry failed posts",
      );
    } finally {
      setRetryingAll(false);
    }
  }

  return (
    <div className="space-y-4">
      {showRetryAll && failedCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 shadow-card">
          <div>
            <p className="text-sm font-medium text-near-black">
              {failedCount} failed post{failedCount === 1 ? "" : "s"}
            </p>
            <p className="mt-1 text-xs text-gray-body">
              Retry publishing now that your connection is fixed.
            </p>
          </div>
          <TextureButton
            type="button"
            variant="primary"
            size="default"
            disabled={retryingAll || retryingId !== null}
            onClick={() => void retryAllFailed()}
          >
            {retryingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying…
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry all failed
              </>
            )}
          </TextureButton>
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {actionError}
        </div>
      ) : null}

      {posts.map((post) => {
        const timestamp = post.publishedAt ?? post.scheduledAt;
        const isRetrying = retryingId === post.id;

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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-label">
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

              <div className="flex flex-wrap items-center gap-3">
                {post.publishError ? (
                  <span className="text-red-600">{post.publishError}</span>
                ) : null}
                {post.status === "failed" ? (
                  <TextureButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isRetrying || retryingAll}
                    onClick={() => void retryPost(post.id)}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        Retrying…
                      </>
                    ) : (
                      <>
                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                        Retry publish
                      </>
                    )}
                  </TextureButton>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
