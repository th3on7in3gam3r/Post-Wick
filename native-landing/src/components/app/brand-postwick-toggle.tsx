"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { postwickBaseUrl } from "@/lib/directory/public-brands";
import { cn } from "@/lib/utils";

export function BrandPostwickToggle({
  brandId,
  initialConnected,
  publicSlug,
  publicNiche,
}: {
  brandId: string;
  initialConnected: boolean;
  publicSlug: string | null;
  publicNiche: string | null;
}) {
  const [connected, setConnected] = useState(initialConnected);
  const [slug, setSlug] = useState(publicSlug);
  const [niche] = useState(publicNiche ?? "");
  const [shareExisting, setShareExisting] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const postwickOrigin = postwickBaseUrl();
  const profileUrl =
    slug && postwickOrigin ? `${postwickOrigin}/b/${slug}` : null;

  async function save(nextConnected: boolean) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/postwick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connected: nextConnected,
          publicNiche: niche.trim() || undefined,
          shareExisting: nextConnected ? shareExisting : false,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        warning?: string;
        sharedCount?: number;
        brand?: {
          postwickAutoShare: boolean;
          publicSlug: string | null;
        };
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not update Postwick connection.",
        );
      }

      setConnected(Boolean(data.brand?.postwickAutoShare));
      setSlug(data.brand?.publicSlug ?? slug);

      if (data.warning) {
        setMessage(data.warning);
      } else if (nextConnected && (data.sharedCount ?? 0) > 0) {
        setMessage(
          `Connected. Shared ${data.sharedCount} published post${
            data.sharedCount === 1 ? "" : "s"
          } to Postwick.`,
        );
      } else if (nextConnected) {
        setMessage(
          "Connected. New published posts will appear on Postwick automatically.",
        );
      } else {
        setMessage(
          "Disconnected. New posts will not auto-share. Existing Postwick posts stay until you unshare them in History.",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function shareAllNow() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/brands/${brandId}/postwick`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connected: true,
          publicNiche: niche.trim() || undefined,
          shareExisting: true,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        warning?: string;
        sharedCount?: number;
        brand?: {
          postwickAutoShare: boolean;
          publicSlug: string | null;
        };
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Could not share posts to Postwick.",
        );
      }

      setConnected(Boolean(data.brand?.postwickAutoShare));
      setSlug(data.brand?.publicSlug ?? slug);

      if (data.warning) {
        setMessage(data.warning);
      } else {
        setMessage(
          `Shared ${data.sharedCount ?? 0} published post${
            (data.sharedCount ?? 0) === 1 ? "" : "s"
          } to Postwick.`,
        );
      }
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
          <p className="text-sm font-medium text-near-black">
            Connect to Postwick
          </p>
          <p className="mt-1 text-sm text-gray-body">
            Show this brand on Postwick and auto-share newly published posts.
            Also enables your public directory listing.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={connected}
          disabled={saving}
          onClick={() => void save(!connected)}
          className={cn(
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            connected ? "bg-gold" : "bg-black/15",
            saving ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              connected && "translate-x-5",
            )}
          />
        </button>
      </div>

      {!connected ? (
        <label className="flex items-start gap-2 text-sm text-gray-body">
          <input
            type="checkbox"
            checked={shareExisting}
            onChange={(event) => setShareExisting(event.target.checked)}
            className="mt-1"
          />
          <span>
            When connecting, also share all currently published posts to
            Postwick.
          </span>
        </label>
      ) : null}

      {connected && profileUrl ? (
        <p className="text-xs text-gray-body">
          Public Postwick page:{" "}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold hover:underline"
          >
            {profileUrl}
          </a>
        </p>
      ) : null}

      {connected && !profileUrl && slug ? (
        <p className="text-xs text-gray-body">
          Profile slug ready: <span className="font-medium">/b/{slug}</span>
          {postwickOrigin
            ? null
            : " (set NEXT_PUBLIC_POSTWICK_URL to show the full link)"}
        </p>
      ) : null}

      {connected ? (
        <TextureButton
          type="button"
          variant="secondary"
          size="sm"
          disabled={saving}
          onClick={() => void shareAllNow()}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Share all published posts now
        </TextureButton>
      ) : null}

      {message ? (
        <p className="text-sm text-emerald-700" role="status">
          {message}
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
