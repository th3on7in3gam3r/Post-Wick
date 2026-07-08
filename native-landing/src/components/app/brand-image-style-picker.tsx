"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import {
  IMAGE_STYLE_OPTIONS,
  type ImageStylePresetId,
  parseImageStylePreset,
} from "@/lib/ai/image-style-presets";
import { cn } from "@/lib/utils";

export function BrandImageStylePicker({
  brandId,
  initialPreset,
}: {
  brandId: string;
  initialPreset?: ImageStylePresetId | string | null;
}) {
  const [preset, setPreset] = useState<ImageStylePresetId>(
    parseImageStylePreset(initialPreset),
  );
  const [savedPreset, setSavedPreset] = useState(preset);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selected = IMAGE_STYLE_OPTIONS.find((option) => option.id === preset);
  const isDirty = preset !== savedPreset;

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/image-style`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageStylePreset: preset }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not update image style.",
        );
      }

      const nextPreset = parseImageStylePreset(data.imageStylePreset);
      setPreset(nextPreset);
      setSavedPreset(nextPreset);
      setSuccess("Image style saved. New images will use this look.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {IMAGE_STYLE_OPTIONS.map((option) => (
          <label
            key={option.id}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 transition",
              preset === option.id
                ? "border-gold/40 bg-gold/[0.06]"
                : "border-black/[0.06] bg-cream/25 hover:bg-cream/50",
            )}
          >
            <input
              type="radio"
              name="image-style-preset"
              value={option.id}
              checked={preset === option.id}
              onChange={() => {
                setPreset(option.id);
                setSuccess(null);
              }}
              className="mt-1 h-4 w-4 shrink-0 accent-gold"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-near-black">
                {option.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-body">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </div>

      {selected ? (
        <p className="text-xs text-gray-body">
          {preset === "auto"
            ? "Auto-detect uses your industry and brand keywords to pick a style."
            : `All new generated images will use the ${selected.label.toLowerCase()} look.`}
        </p>
      ) : null}

      <TextureButton
        type="button"
        variant="secondary"
        size="sm"
        disabled={saving || !isDirty}
        onClick={() => void save()}
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save image style
      </TextureButton>

      {success ? (
        <p className="text-sm text-emerald-700" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
