"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { GENERATE_PLATFORMS } from "@/lib/platforms";

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
};

export function GeneratePostsButton({
  brandId,
  generateMax,
  platform: initialPlatform = "linkedin",
  layout = "stacked",
}: {
  brandId: string;
  generateMax: number;
  platform?: string;
  layout?: "stacked" | "toolbar";
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState(
    GENERATE_PLATFORMS.includes(initialPlatform as (typeof GENERATE_PLATFORMS)[number])
      ? initialPlatform
      : "linkedin",
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, count: generateMax }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to generate posts",
        );
      }

      const parts = [
        `Generated ${data.count} ${PLATFORM_LABELS[platform] ?? platform} posts${data.source === "ai" ? " with AI" : ""}.`,
      ];

      if (data.imagesGenerated > 0) {
        parts.push(`${data.imagesGenerated} include images.`);
      } else if (platform === "instagram") {
        parts.push("Instagram posts need images — use Add images on this page.");
      } else if (data.imageHint) {
        parts.push(data.imageHint);
      }

      setMessage(parts.join(" "));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const controls = (
    <>
      <label className="sr-only" htmlFor={`generate-platform-${brandId}`}>
        Platform
      </label>
      <select
        id={`generate-platform-${brandId}`}
        value={platform}
        disabled={loading}
        onChange={(event) => setPlatform(event.target.value)}
        className={
          layout === "toolbar"
            ? "min-w-[8.5rem] flex-1 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm text-near-black outline-none focus:border-gold/50 sm:flex-none"
            : "w-full rounded-full border border-black/[0.1] bg-cream/50 px-3 py-2 text-sm text-near-black outline-none focus:border-gold/50 sm:w-auto"
        }
      >
        {GENERATE_PLATFORMS.map((item) => (
          <option key={item} value={item}>
            {PLATFORM_LABELS[item]}
          </option>
        ))}
      </select>
      <TextureButton
        type="button"
        variant="primary"
        size={layout === "toolbar" ? "sm" : "default"}
        disabled={loading}
        className={layout === "toolbar" ? "shrink-0" : "w-full sm:w-auto"}
        onClick={() => void handleGenerate()}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {loading ? "Generating…" : `Generate ${generateMax}`}
      </TextureButton>
    </>
  );

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <div
        className={
          layout === "toolbar"
            ? "flex flex-col gap-2 sm:flex-row sm:items-center"
            : "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
        }
      >
        {controls}
      </div>
      {platform === "instagram" ? (
        <p className="text-xs text-gray-body">
          Instagram drafts include square images when image APIs are configured.
        </p>
      ) : null}
      {message ? <p className="text-xs text-gray-body">{message}</p> : null}
    </div>
  );
}
