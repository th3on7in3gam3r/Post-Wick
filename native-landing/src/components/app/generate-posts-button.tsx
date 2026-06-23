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

      const parts = [
        `Generated ${data.count} posts${data.source === "ai" ? " with AI" : ""}.`,
      ];

      if (data.imagesGenerated > 0) {
        parts.push(`${data.imagesGenerated} include images.`);
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
