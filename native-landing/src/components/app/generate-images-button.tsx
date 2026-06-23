"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

export function GenerateImagesButton({
  brandId,
  missingCount,
}: {
  brandId: string;
  missingCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (missingCount <= 0) return null;

  async function handleGenerate() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 12 }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to generate images",
        );
      }

      const parts = [`Added images to ${data.updated} post${data.updated === 1 ? "" : "s"}.`];
      if (data.imageHint) parts.push(data.imageHint);
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
        variant="secondary"
        size="sm"
        disabled={loading}
        onClick={() => void handleGenerate()}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {loading ? "Creating images…" : `Add images (${missingCount})`}
      </TextureButton>
      {message ? <p className="text-xs text-gray-body">{message}</p> : null}
    </div>
  );
}
