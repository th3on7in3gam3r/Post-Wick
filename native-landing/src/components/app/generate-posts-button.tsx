"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

export function GeneratePostsButton({
  brandId,
  generateMax,
  platform = "linkedin",
}: {
  brandId: string;
  generateMax: number;
  platform?: string;
}) {
  const router = useRouter();
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

      setMessage(
        [
          `Generated ${data.count} posts${data.source === "ai" ? " with AI" : ""}.`,
          data.imagesConfigured
            ? data.imagesGenerated > 0
              ? `${data.imagesGenerated} include images.`
              : "No images were created — check IDEOGRAM_API_KEY or OPENAI_API_KEY in native-landing/.env.local and restart the dev server."
            : "Add IDEOGRAM_API_KEY or OPENAI_API_KEY to native-landing/.env.local for images.",
        ].join(" "),
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <TextureButton
        type="button"
        variant="primary"
        size="default"
        disabled={loading}
        onClick={() => void handleGenerate()}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {loading ? "Generating…" : `Generate ${generateMax} posts`}
      </TextureButton>
      {message ? <p className="text-xs text-gray-body">{message}</p> : null}
    </div>
  );
}
