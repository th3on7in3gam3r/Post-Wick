"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TextureButton } from "@/components/ui/texture-button";

export function BlueskyConnectClient({ brandId }: { brandId: string }) {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch("/api/social/bluesky/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, handle }),
      });
      const data = (await response.json().catch(() => null)) as {
        redirectUrl?: string;
        error?: string;
      } | null;

      if (!response.ok || !data?.redirectUrl) {
        setError(data?.error || "Could not start Bluesky authorization");
        setPending(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setError("Could not start Bluesky authorization");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-5">
      <div>
        <label htmlFor="bluesky-handle" className="text-sm font-medium text-near-black">
          Bluesky handle
        </label>
        <input
          id="bluesky-handle"
          name="handle"
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@you.bsky.social"
          autoComplete="username"
          className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-near-black outline-none ring-gold/30 focus:ring-2"
          required
        />
        <p className="mt-2 text-xs text-gray-body">
          Enter your handle, then approve Kerygma Social on Bluesky. Local OAuth must use{" "}
          <code className="rounded bg-cream px-1">127.0.0.1</code>, not localhost.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <TextureButton type="submit" variant="primary" disabled={pending}>
          {pending ? "Redirecting…" : "Continue to Bluesky"}
        </TextureButton>
        <TextureButton asChild variant="secondary" type="button">
          <Link href="/settings/integrations" onClick={() => router.refresh()}>
            Cancel
          </Link>
        </TextureButton>
      </div>
    </form>
  );
}
