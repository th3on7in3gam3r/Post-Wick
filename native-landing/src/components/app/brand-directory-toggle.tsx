"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

export function BrandDirectoryToggle({
  brandId,
  initialIsPublic,
  publicSlug,
  publicNiche,
}: {
  brandId: string;
  initialIsPublic: boolean;
  publicSlug: string | null;
  publicNiche: string | null;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [niche, setNiche] = useState(publicNiche ?? "");
  const [slug, setSlug] = useState(publicSlug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextIsPublic: boolean) {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/directory`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublic: nextIsPublic,
          publicNiche: niche.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not update directory listing.",
        );
      }

      setIsPublic(data.brand.isPublic);
      setSlug(data.brand.publicSlug ?? null);
      setNiche(data.brand.publicNiche ?? niche);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-near-black">Public directory</p>
          <p className="mt-1 text-sm text-gray-body">
            List this brand on the crawlable Kerygma Social directory.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          disabled={saving}
          onClick={() => void save(!isPublic)}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            isPublic ? "bg-gold" : "bg-black/15",
            saving ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              isPublic && "translate-x-5",
            )}
          />
        </button>
      </div>

      {isPublic ? (
        <div className="space-y-3 rounded-xl border border-black/[0.06] bg-cream/50 p-4">
          <label className="block text-sm font-medium text-near-black" htmlFor="public-niche">
            Niche label
          </label>
          <input
            id="public-niche"
            type="text"
            value={niche}
            onChange={(event) => setNiche(event.target.value)}
            placeholder="Church, Coffee shop, Retail…"
            className="w-full rounded-xl border border-black/[0.1] bg-white px-4 py-2.5 text-sm outline-none ring-gold/30 focus:ring-2"
          />
          <TextureButton
            type="button"
            variant="secondary"
            size="sm"
            disabled={saving}
            onClick={() => void save(true)}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save niche
          </TextureButton>
          {slug ? (
            <p className="text-xs text-gray-body">
              Public page:{" "}
              <Link href={`/directory/${slug}`} className="font-medium text-gold hover:underline">
                /directory/{slug}
              </Link>
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
