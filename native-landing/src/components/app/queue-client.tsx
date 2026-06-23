"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
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

export function QueueClient({ initialPosts }: { initialPosts: QueuePost[] }) {
  const router = useRouter();
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
  const current = posts[0];

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    setInstruction("");
    setRegenerateImage(false);
    setRefineResult(null);
    setSelectedCaption(0);
    setSelectedImageId("current");
    setError(null);
  }, [current?.id]);

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

  if (!current) {
    return (
      <p className="text-center text-sm text-gray-body">
        All caught up. Generate more posts from your brand page.
      </p>
    );
  }

  const busy = acting || refining || applying;

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
        ) : (
          <p className="mt-3 text-xs text-gray-label">No image for this draft</p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-near-black">{current.content}</p>
      </article>

      <section className="mt-6 rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-sm font-medium text-near-black">Refine with Post-Wick</p>
        </div>
        <p className="mt-2 text-sm text-gray-body">
          Almost love it? Describe what to change in plain words and pick your favorite
          version.
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

      <div className="mt-6 flex justify-center gap-3">
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
          variant="primary"
          size="default"
          disabled={busy}
          onClick={() => void handleAction("approve")}
        >
          <Check className="mr-2 h-4 w-4" />
          {acting ? "Saving…" : "Approve"}
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
      {error ? (
        <p className="mt-3 text-center text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
