"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, Loader2 } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

type Brand = {
  id: string;
  name: string;
};

type Connection = {
  id: string;
  brandId: string;
  platform: string;
  accountName: string | null;
  isDemo: boolean;
};

const platforms = [
  { id: "linkedin", label: "LinkedIn", enabled: true },
  { id: "instagram", label: "Instagram", enabled: false },
  { id: "facebook", label: "Facebook", enabled: false },
  { id: "twitter", label: "X", enabled: false },
  { id: "tiktok", label: "TikTok", enabled: false },
] as const;

export function ConnectionsClient({
  brands,
  initialConnections,
  linkedInConfigured,
  flash,
}: {
  brands: Brand[];
  initialConnections: Connection[];
  linkedInConfigured: boolean;
  flash?: string | null;
}) {
  const router = useRouter();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [connections, setConnections] = useState(initialConnections);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  const brandConnections = connections.filter((item) => item.brandId === brandId);

  async function connectDemo(platform: string) {
    if (!brandId) return;
    setLoadingPlatform(platform);

    try {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, platform }),
      });
      const data = await response.json();
      if (response.ok) {
        setConnections((prev) => {
          const filtered = prev.filter(
            (item) => !(item.brandId === brandId && item.platform === platform),
          );
          return [data, ...filtered];
        });
        router.refresh();
      }
    } finally {
      setLoadingPlatform(null);
    }
  }

  async function disconnect(connectionId: string) {
    setLoadingPlatform(connectionId);
    try {
      const response = await fetch(`/api/connections?id=${connectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConnections((prev) => prev.filter((item) => item.id !== connectionId));
        router.refresh();
      }
    } finally {
      setLoadingPlatform(null);
    }
  }

  function connectLinkedIn() {
    if (!brandId) return;
    window.location.href = `/api/social/linkedin/connect?brandId=${brandId}`;
  }

  if (brands.length === 0) {
    return (
      <p className="text-sm text-gray-body">
        Add a brand first, then connect the channels autopilot will publish to.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <div className="rounded-xl border border-gold/25 bg-cream/60 px-4 py-3 text-sm text-near-black">
          {flash}
        </div>
      ) : null}

      <div>
        <label className="text-sm font-medium text-near-black" htmlFor="brand-select">
          Brand
        </label>
        <select
          id="brand-select"
          value={brandId}
          onChange={(event) => setBrandId(event.target.value)}
          className="mt-2 w-full max-w-md rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-near-black"
        >
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => {
          const connection = brandConnections.find((item) => item.platform === platform.id);
          const isLoading = loadingPlatform === platform.id || loadingPlatform === connection?.id;

          return (
            <article
              key={platform.id}
              className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-playfair text-lg italic text-near-black">
                    {platform.label}
                  </h3>
                  <p className="mt-1 text-xs text-gray-body">
                    {platform.enabled
                      ? "Ready for autopilot publishing"
                      : "Coming in a later release"}
                  </p>
                </div>
                {connection ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
                ) : (
                  <Link2 className="h-5 w-5 shrink-0 text-gray-label" />
                )}
              </div>

              {connection ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-near-black">
                    {connection.accountName}
                    {connection.isDemo ? (
                      <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-gray-label">
                        Demo
                      </span>
                    ) : null}
                  </p>
                  <TextureButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => void disconnect(connection.id)}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Disconnect
                  </TextureButton>
                </div>
              ) : platform.enabled ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {platform.id === "linkedin" && linkedInConfigured ? (
                    <TextureButton
                      type="button"
                      variant="primary"
                      size="sm"
                      disabled={isLoading}
                      onClick={connectLinkedIn}
                    >
                      Connect with LinkedIn
                    </TextureButton>
                  ) : null}
                  <TextureButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => void connectDemo(platform.id)}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {linkedInConfigured && platform.id === "linkedin"
                      ? "Use demo mode"
                      : "Connect demo account"}
                  </TextureButton>
                </div>
              ) : (
                <p className="mt-4 text-xs text-gray-label">Not available yet</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
