"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { formatScheduleLabel } from "@/lib/scheduling/slots";

type QueuePost = {
  id: string;
  content: string;
  platform: string;
  imageUrl?: string | null;
};

export function QueueClient({ initialPosts }: { initialPosts: QueuePost[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [lastScheduled, setLastScheduled] = useState<string | null>(null);
  const current = posts[0];

  async function handleAction(action: "approve" | "skip") {
    if (!current) return;

    const response = await fetch(`/api/posts/${current.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (response.ok) {
      const data = await response.json();
      if (action === "approve" && data.scheduledAt) {
        setLastScheduled(data.scheduledAt as string);
      }
      setPosts((prev) => prev.filter((post) => post.id !== current.id));
    }
  }

  if (!current) {
    return (
      <p className="text-center text-sm text-gray-body">
        All caught up. Generate more posts from your brand page.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <article className="rounded-2xl border border-black/[0.06] bg-cream/40 p-6 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          {current.platform}
        </p>
        {current.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.imageUrl}
            alt=""
            className="mt-4 aspect-square w-full rounded-xl border border-black/[0.06] object-cover"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <p className="mt-4 text-sm leading-relaxed text-near-black">{current.content}</p>
      </article>

      <div className="mt-6 flex justify-center gap-3">
        <TextureButton
          type="button"
          variant="secondary"
          size="default"
          onClick={() => void handleAction("skip")}
        >
          <X className="mr-2 h-4 w-4" />
          Skip
        </TextureButton>
        <TextureButton
          type="button"
          variant="primary"
          size="default"
          onClick={() => void handleAction("approve")}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </TextureButton>
      </div>

      <p className="mt-4 text-center text-sm text-gray-body">
        {posts.length} remaining
      </p>
      {lastScheduled ? (
        <p className="mt-2 text-center text-xs text-gold">
          Scheduled for {formatScheduleLabel(lastScheduled)}
        </p>
      ) : null}
    </div>
  );
}
