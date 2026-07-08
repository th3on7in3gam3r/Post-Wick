"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, RefreshCw } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

export function GenerateImagesButton({
  brandId,
  missingCount = 0,
  postCount = 0,
  label,
  regenerate = false,
  variant = "secondary",
}: {
  brandId: string;
  missingCount?: number;
  postCount?: number;
  label?: string;
  regenerate?: boolean;
  variant?: "primary" | "secondary" | "minimal";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const count = regenerate ? postCount : missingCount;
  if (count <= 0) return null;

  async function handleGenerate() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 12, regenerate }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Failed to generate images",
        );
      }

      const verb = regenerate ? "Regenerated" : "Added";
      const parts = [`${verb} images for ${data.updated} post${data.updated === 1 ? "" : "s"}.`];
      if (data.remaining > 0) {
        parts.push(`${data.remaining} more in queue — run again to continue.`);
      }
      if (data.imageHint) parts.push(data.imageHint);
      setMessage(parts.join(" "));
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const defaultLabel = regenerate
    ? `Regenerate images (${count})`
    : `${label ?? "Add images"} (${count})`;

  return (
    <div className="flex flex-col items-start gap-2">
      <TextureButton
        type="button"
        variant={variant}
        size="sm"
        disabled={loading}
        onClick={() => void handleGenerate()}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : regenerate ? (
          <RefreshCw className="mr-2 h-4 w-4" />
        ) : (
          <ImagePlus className="mr-2 h-4 w-4" />
        )}
        {loading ? (regenerate ? "Regenerating…" : "Creating images…") : defaultLabel}
      </TextureButton>
      {message ? <p className="text-xs text-gray-body">{message}</p> : null}
    </div>
  );
}
