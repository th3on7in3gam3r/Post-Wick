"use client";

import { use } from "react";
import { Header } from "@/components/app/header";
import { SwipeQueue } from "@/components/posts/swipe-queue";
import { toast } from "sonner";

export default function QueuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const posts: Array<{
    id: string;
    content: string;
    platform: string;
    status: string;
    imageUrl?: string | null;
  }> = [];

  async function handleAction(
    postId: string,
    action: "approve" | "skip" | "refine",
  ) {
    const res = await fetch(
      `/api/brands/${id}/posts/${postId}/${action}`,
      { method: "POST" },
    );
    if (!res.ok) {
      toast.error(`Failed to ${action} post`);
      return;
    }
    toast.success(`Post ${action}d`);
  }

  return (
    <>
      <Header title="Approval queue" />
      <div className="flex-1 p-6">
        <SwipeQueue
          posts={posts}
          onApprove={(postId) => handleAction(postId, "approve")}
          onSkip={(postId) => handleAction(postId, "skip")}
          onRefine={(postId) => handleAction(postId, "refine")}
        />
      </div>
    </>
  );
}
