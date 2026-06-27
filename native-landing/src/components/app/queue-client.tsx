"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { useActiveClient } from "@/components/app/client-context";
import { PlatformPostPreview } from "@/components/app/platform-post-preview";
import { TextureButton } from "@/components/ui/texture-button";
import { clientInitials } from "@/lib/clients";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { REFINE_QUICK_PICKS } from "@/lib/ai/prompts";
import { cn } from "@/lib/utils";

type QueuePost = {
  id: string;
  content: string;
  platform: string;
  imageUrl?: string | null;
};

type RefineImageOption = {
  id: "current" | "new";
  url: string | null;
  label: string;
};

type RefineResult = {
  captions: string[];
  images: RefineImageOption[];
  source: "ai" | "template";
  imageWarning?: string | null;
};

function PostCardSkeleton() {
  return (
    <div
      className="animate-pulse overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card"
      aria-busy="true"
      aria-label="Generating a new version"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-10 w-10 rounded-full bg-black/[0.06]" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-black/[0.08]" />
          <div className="h-2 w-16 rounded bg-black/[0.06]" />
        </div>
      </div>
      <div className="aspect-square w-full bg-black/[0.06]" />
      <div className="space-y-2 px-4 py-4">
        <div className="h-3 w-full rounded bg-black/[0.06]" />
        <div className="h-3 w-full rounded bg-black/[0.06]" />
        <div className="h-3 w-[80%] rounded bg-black/[0.06]" />
      </div>
      <p className="flex items-center justify-center gap-2 pb-4 text-sm text-gray-body">
        <Loader2 className="h-4 w-4 animate-spin text-gold" />
        Writing a new version…
      </p>
    </div>
  );
}

async function regeneratePost(
  post: QueuePost,
  instruction: string,
): Promise<Pick<QueuePost, "content" | "imageUrl">> {
  const refineInstruction =
    instruction.trim() ||
    "Write a completely fresh version of this post with a new angle.";

  const refineResponse = await fetch(`/api/posts/${post.id}/refine`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instruction: refineInstruction,
      regenerateImage: post.platform.toLowerCase() === "instagram",
    }),
  });

  const refineData = (await refineResponse.json().catch(() => ({}))) as RefineResult & {
    error?: string;
  };

  if (!refineResponse.ok) {
    throw new Error(
      typeof refineData.error === "string"
        ? refineData.error
        : "Could not regenerate this post",
    );
  }

  const caption = refineData.captions[0];
  if (!caption) {
    throw new Error("No regenerated caption was returned");
  }

  const newImage = refineData.images.find((image) => image.id === "new" && image.url);
  const imageUrl = newImage?.url ?? refineData.images[0]?.url ?? post.imageUrl ?? null;

  const patchResponse = await fetch(`/api/posts/${post.id}`, {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: caption,
      imageUrl,
    }),
  });

  const patchData = (await patchResponse.json().catch(() => ({}))) as {
    content?: string;
    imageUrl?: string | null;
    error?: string;
  };

  if (!patchResponse.ok) {
    throw new Error(
      typeof patchData.error === "string"
        ? patchData.error
        : "Could not save the regenerated post",
    );
  }

  return {
    content: patchData.content ?? caption,
    imageUrl: patchData.imageUrl ?? imageUrl,
  };
}

export function QueueClient({ initialPosts }: { initialPosts: QueuePost[] }) {
  const router = useRouter();
  const { activeClient } = useActiveClient();
  const [posts, setPosts] = useState(initialPosts);
  const [lastScheduled, setLastScheduled] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [regenerateImage, setRegenerateImage] = useState(false);
  const [refining, setRefining] = useState(false);
  const [applying, setApplying] = useState(false);
  const [refineResult, setRefineResult] = useState<RefineResult | null>(null);
  const [selectedCaption, setSelectedCaption] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<"current" | "new">(
    "current",
  );
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [regenerateInstruction, setRegenerateInstruction] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const regeneratePopoverRef = useRef<HTMLDivElement>(null);
  const total = useRef(initialPosts.length);
  const reviewed = total.current - posts.length;
  const current = posts[0];
  const busy = acting || refining || applying || regenerating;

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    setInstruction("");
    setRegenerateImage(false);
    setRefineResult(null);
    setSelectedCaption(0);
    setSelectedImageId("current");
    setRegenerateOpen(false);
    setRegenerateInstruction("");
    setError(null);
  }, [current?.id]);

  useEffect(() => {
    if (!regenerateOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        regeneratePopoverRef.current &&
        !regeneratePopoverRef.current.contains(event.target as Node)
      ) {
        setRegenerateOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [regenerateOpen]);

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(null), 8000);
    return () => window.clearTimeout(timer);
  }, [error]);

  async function handleAction(action: "approve" | "skip") {
    if (!current || acting) return;

    setActing(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${current.id}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : `Could not ${action} post (${response.status})`,
        );
      }

      if (action === "approve" && data.scheduledAt) {
        setLastScheduled(data.scheduledAt as string);
      }

      setPosts((prev) => prev.filter((post) => post.id !== current.id));
      router.refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setActing(false);
    }
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.target instanceof HTMLInputElement) return;
      if (busy || !current) return;

      if (e.key === "ArrowRight" || e.key === "a") {
        void handleAction("approve");
      } else if (e.key === "ArrowLeft" || e.key === "s") {
        void handleAction("skip");
      } else if (e.key === "r") {
        setRegenerateOpen((prev) => !prev);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [busy, current]);

  async function handleRefine() {
    if (!current || refining || instruction.trim().length < 3) return;

    setRefining(true);
    setError(null);
    setRefineResult(null);

    try {
      const response = await fetch(`/api/posts/${current.id}/refine`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: instruction.trim(),
          regenerateImage,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not refine this post",
        );
      }

      setRefineResult(data as RefineResult);
      setSelectedCaption(0);
      setSelectedImageId(
        data.images?.some((image: RefineImageOption) => image.id === "new")
          ? "new"
          : "current",
      );
    } catch (refineError) {
      setError(
        refineError instanceof Error
          ? refineError.message
          : "Refine failed. Try again in a moment.",
      );
    } finally {
      setRefining(false);
    }
  }

  async function handleApplyRefinement() {
    if (!current || !refineResult || applying) return;

    const caption = refineResult.captions[selectedCaption];
    if (!caption) return;

    const selectedImage =
      refineResult.images.find((image) => image.id === selectedImageId) ??
      refineResult.images[0];

    setApplying(true);
    setError(null);

    try {
      const response = await fetch(`/api/posts/${current.id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: caption,
          imageUrl: selectedImage?.url ?? null,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not apply your refinement",
        );
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === current.id
            ? {
                ...post,
                content: data.content as string,
                imageUrl: (data.imageUrl as string | null) ?? null,
              }
            : post,
        ),
      );
      setRefineResult(null);
      setInstruction("");
      setRegenerateImage(false);
      router.refresh();
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Could not apply your refinement",
      );
    } finally {
      setApplying(false);
    }
  }

  async function handleRegenerate() {
    if (!current || regenerating) return;

    setRegenerateOpen(false);
    setRegenerating(true);
    setError(null);
    setRefineResult(null);

    try {
      const next = await regeneratePost(current, regenerateInstruction);

      setPosts((prev) =>
        prev.map((post) =>
          post.id === current.id
            ? {
                ...post,
                content: next.content,
                imageUrl: next.imageUrl ?? post.imageUrl,
              }
            : post,
        ),
      );
      setRegenerateInstruction("");
      router.refresh();
    } catch (regenerateError) {
      setError(
        regenerateError instanceof Error
          ? regenerateError.message
          : "Could not regenerate this post. Try again.",
      );
    } finally {
      setRegenerating(false);
    }
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-xl">
        <EmptyState
          icon={CheckCircle2}
          title="You're all caught up!"
          description="Generate your next batch of posts when you're ready."
          action={
            <TextureButton asChild variant="primary" size="default">
              <Link href="/brands">Generate more posts</Link>
            </TextureButton>
          }
        />
        {lastScheduled ? (
          <p className="mt-4 text-center text-xs text-gray-label">
            Last approved: scheduled for {formatScheduleLabel(lastScheduled)}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {error ? (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <span className="font-medium">Something went wrong:</span> {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      ) : null}
      {posts.length > 0 ? (
        <div className="mb-4 text-center text-xs text-gray-label">
          <p>
            {posts.length} post{posts.length !== 1 ? "s" : ""} waiting for review
          </p>
          {total.current > 0 ? (
            <p className="mt-1">
              Post {reviewed + 1} of {total.current}
            </p>
          ) : null}
        </div>
      ) : null}
      {regenerating ? (
        <PostCardSkeleton />
      ) : (
        <>
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.12em] text-gray-label">
            Preview · {current.platform}
          </p>
          <PlatformPostPreview
            platform={current.platform}
            content={current.content}
            imageUrl={current.imageUrl}
            accountName={activeClient.name || "Your brand"}
            accountAvatarUrl={activeClient.logoUrl}
            accountInitials={clientInitials(activeClient.name)}
          />
        </>
      )}

      <section
        className={cn(
          "mt-6 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card transition-opacity",
          regenerating && "pointer-events-none opacity-50",
        )}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-sm font-medium text-near-black">Refine with Kerygma Social</p>
        </div>
        <p className="mt-2 text-sm text-gray-body">
          Almost there? Give specific instructions and pick your favorite version. (Keeps
          the same post, adjusts it.)
        </p>
        <textarea
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder="Make it shorter and friendlier, mention our weekend hours…"
          rows={3}
          disabled={busy}
          className="mt-4 w-full resize-none rounded-xl border border-black/[0.1] bg-cream/30 px-4 py-3 text-sm text-near-black outline-none placeholder:text-gray-label focus:border-gold/50"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {REFINE_QUICK_PICKS.map((pick) => (
            <button
              key={pick.pillar}
              type="button"
              disabled={busy}
              onClick={() => setInstruction(pick.instruction)}
              className="rounded-full border border-black/[0.08] bg-cream/50 px-3 py-1 text-xs font-medium text-gray-body transition hover:border-gold/30 hover:text-near-black disabled:opacity-50"
            >
              {pick.label}
            </button>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-gray-body">
          <input
            type="checkbox"
            checked={regenerateImage}
            onChange={(event) => setRegenerateImage(event.target.checked)}
            disabled={busy}
            className="h-4 w-4 rounded border-black/20 text-gold focus:ring-gold/30"
          />
          Also try a new image variation
        </label>
        <TextureButton
          type="button"
          variant="secondary"
          size="sm"
          className="mt-4"
          disabled={busy || instruction.trim().length < 3}
          onClick={() => void handleRefine()}
        >
          {refining ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {refining ? "Refining…" : "Refine post"}
        </TextureButton>

        {refineResult ? (
          <div className="mt-5 space-y-5 border-t border-black/[0.06] pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                Pick a caption
              </p>
              <div className="mt-3 space-y-2">
                {refineResult.captions.map((caption, index) => (
                  <button
                    key={`${caption.slice(0, 24)}-${index}`}
                    type="button"
                    onClick={() => setSelectedCaption(index)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition",
                      selectedCaption === index
                        ? "border-gold/40 bg-cream/70 text-near-black"
                        : "border-black/[0.08] bg-white text-gray-body hover:border-black/[0.12]",
                    )}
                  >
                    {caption}
                  </button>
                ))}
              </div>
            </div>

            {refineResult.images.length > 1 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                  Pick an image
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {refineResult.images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageId(image.id)}
                      className={cn(
                        "overflow-hidden rounded-xl border text-left transition",
                        selectedImageId === image.id
                          ? "border-gold/40 ring-2 ring-gold/20"
                          : "border-black/[0.08] hover:border-black/[0.12]",
                      )}
                    >
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt=""
                          className="aspect-square w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="flex aspect-square items-center justify-center bg-cream/50 px-3 text-center text-xs text-gray-label">
                          No image
                        </div>
                      )}
                      <p className="px-3 py-2 text-xs font-medium text-near-black">
                        {image.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {refineResult.imageWarning ? (
              <p className="text-xs text-gray-body">{refineResult.imageWarning}</p>
            ) : null}

            <TextureButton
              type="button"
              variant="primary"
              size="sm"
              disabled={applying}
              onClick={() => void handleApplyRefinement()}
            >
              {applying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {applying ? "Applying…" : "Use this version"}
            </TextureButton>
          </div>
        ) : null}
      </section>

      <div className="relative mt-6 flex flex-wrap justify-center gap-3" ref={regeneratePopoverRef}>
        {regenerateOpen ? (
          <div className="absolute bottom-full left-1/2 z-20 mb-3 w-[min(100%,20rem)] -translate-x-1/2 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-card">
            <p className="text-sm font-medium text-near-black">
              Any direction for the new version?
            </p>
            <p className="mt-1 text-xs text-gray-body">
              Starts fresh — writes a completely new post from scratch.
            </p>
            <p className="mt-1 text-xs text-gray-label">Optional — leave blank for a fresh rewrite.</p>
            <input
              type="text"
              value={regenerateInstruction}
              onChange={(event) => setRegenerateInstruction(event.target.value)}
              placeholder="Shorter, more playful, mention our sale…"
              disabled={busy}
              className="mt-3 w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-2.5 text-sm text-near-black outline-none placeholder:text-gray-label focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleRegenerate();
                }
              }}
            />
            <div className="mt-3 flex gap-2">
              <TextureButton
                type="button"
                variant="primary"
                size="sm"
                className="flex-1"
                disabled={busy}
                onClick={() => void handleRegenerate()}
              >
                Start fresh
              </TextureButton>
              <TextureButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => setRegenerateOpen(false)}
              >
                Cancel
              </TextureButton>
            </div>
          </div>
        ) : null}

        <TextureButton
          type="button"
          variant="secondary"
          size="default"
          disabled={busy}
          onClick={() => void handleAction("skip")}
        >
          <X className="mr-2 h-4 w-4" />
          Skip
        </TextureButton>
        <TextureButton
          type="button"
          variant="secondary"
          size="default"
          disabled={busy}
          onClick={() => setRegenerateOpen((open) => !open)}
          aria-expanded={regenerateOpen}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Start fresh ↺
        </TextureButton>
        <TextureButton
          type="button"
          variant="primary"
          size="default"
          disabled={busy}
          onClick={() => void handleAction("approve")}
        >
          <Check className="mr-2 h-4 w-4" />
          {acting ? "Saving…" : "Approve"}
        </TextureButton>
      </div>

      <p className="mt-3 text-center text-xs text-gray-label">
        ← Skip &nbsp;·&nbsp; Approve → &nbsp;·&nbsp; R to start fresh
      </p>

      {lastScheduled ? (
        <p className="mt-2 text-center text-xs text-gold">
          Scheduled for {formatScheduleLabel(lastScheduled)}
        </p>
      ) : null}
    </div>
  );
}
