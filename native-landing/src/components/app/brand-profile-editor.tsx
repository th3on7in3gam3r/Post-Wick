"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TagInput } from "@/components/app/tag-input";
import { TextureButton } from "@/components/ui/texture-button";
import type { BrandProfileForm } from "@/lib/brand-voice";

const fieldClassName =
  "w-full rounded-xl border border-black/[0.1] bg-white px-4 py-3 text-sm text-near-black outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

export function BrandProfileEditor({
  brandId,
  initialProfile,
}: {
  brandId: string;
  initialProfile: BrandProfileForm;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isDirty =
    profile.tone !== savedProfile.tone ||
    profile.uniqueValueProposition !== savedProfile.uniqueValueProposition ||
    JSON.stringify(profile.keyTopics) !== JSON.stringify(savedProfile.keyTopics);

  const canSave =
    profile.tone.trim().length > 0 &&
    profile.uniqueValueProposition.trim().length > 0 &&
    profile.keyTopics.length > 0;

  async function save() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: profile.tone.trim(),
          uniqueValueProposition: profile.uniqueValueProposition.trim(),
          keyTopics: profile.keyTopics,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not save brand profile.",
        );
      }

      const next: BrandProfileForm = {
        tone: String(data.profile.tone),
        uniqueValueProposition: String(data.profile.uniqueValueProposition),
        keyTopics: Array.isArray(data.profile.keyTopics)
          ? (data.profile.keyTopics as string[])
          : profile.keyTopics,
      };
      setProfile(next);
      setSavedProfile(next);
      setSuccess("Brand profile saved. New posts will use this voice.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-body">
        Auto-detected from your website crawl. Edit anything that doesn&apos;t sound right.
      </p>

      <div>
        <label htmlFor="brand-tone" className="block text-sm font-medium text-near-black">
          Tone
        </label>
        <p className="mt-1 text-xs text-gray-label">
          How your brand sounds — e.g. &ldquo;Warm and playful&rdquo;
        </p>
        <input
          id="brand-tone"
          type="text"
          value={profile.tone}
          disabled={saving}
          onChange={(event) =>
            setProfile((current) => ({ ...current, tone: event.target.value }))
          }
          className={`${fieldClassName} mt-2`}
        />
      </div>

      <div>
        <label
          htmlFor="brand-value-proposition"
          className="block text-sm font-medium text-near-black"
        >
          Value proposition
        </label>
        <p className="mt-1 text-xs text-gray-label">
          What you offer and why it matters to your audience.
        </p>
        <textarea
          id="brand-value-proposition"
          value={profile.uniqueValueProposition}
          disabled={saving}
          rows={4}
          onChange={(event) =>
            setProfile((current) => ({
              ...current,
              uniqueValueProposition: event.target.value,
            }))
          }
          className={`${fieldClassName} mt-2 resize-none`}
        />
      </div>

      <TagInput
        id="brand-key-topics"
        label="Key topics"
        hint="Themes and angles to weave into your posts."
        tags={profile.keyTopics}
        onChange={(keyTopics) => setProfile((current) => ({ ...current, keyTopics }))}
        placeholder="Kids ministry, Scripture games, parent tips…"
        disabled={saving}
      />

      <TextureButton
        type="button"
        variant="secondary"
        size="sm"
        disabled={saving || !isDirty || !canSave}
        onClick={() => void save()}
      >
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save profile
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
