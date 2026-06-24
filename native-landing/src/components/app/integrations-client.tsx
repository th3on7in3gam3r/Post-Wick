"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Link2,
  Loader2,
  Plug,
  Sparkles,
} from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { MetaSetupGuide, type MetaSetupInfo } from "@/components/app/meta-setup-guide";
import { TextureButton } from "@/components/ui/texture-button";
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_PLATFORMS,
  type IntegrationCategory,
  type IntegrationPlatformId,
} from "@/lib/integrations/catalog";
import type { PlatformRuntimeConfig } from "@/lib/integrations/config";
import { cn } from "@/lib/utils";

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

const PLATFORM_ACCENTS: Record<IntegrationPlatformId, string> = {
  linkedin: "bg-[#0A66C2]/10 text-[#0A66C2]",
  instagram: "bg-[#E4405F]/10 text-[#E4405F]",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  twitter: "bg-black/10 text-near-black",
  tiktok: "bg-black/10 text-near-black",
  pinterest: "bg-[#BD081C]/10 text-[#BD081C]",
  google_business: "bg-[#4285F4]/10 text-[#4285F4]",
};

function flashMessage(searchParams: {
  connected?: string;
  error?: string;
}) {
  if (searchParams.connected === "linkedin") {
    return "LinkedIn connected. Approved posts can publish when they are due.";
  }
  if (searchParams.connected === "instagram") {
    return "Instagram connected. Image posts can publish to your Business account.";
  }
  if (searchParams.connected === "facebook") {
    return "Facebook Page connected. Approved posts can publish when they are due.";
  }
  if (searchParams.error === "linkedin_exchange_failed") {
    return "LinkedIn authorization failed. Try again or use demo mode.";
  }
  if (searchParams.error === "meta_no_instagram") {
    return "No Instagram Business account is linked to your Facebook Page. Link them in Meta Business Suite, then try again.";
  }
  if (searchParams.error === "meta_exchange_failed") {
    return "Meta authorization failed. Confirm your Page and Instagram Business account are linked.";
  }
  if (searchParams.error) {
    return "Connection failed. Please try again.";
  }
  return null;
}

export function IntegrationsClient({
  brands,
  initialConnections,
  runtimeConfig,
  metaSetup,
  showMetaAdminGuide,
  flashParams,
}: {
  brands: Brand[];
  initialConnections: Connection[];
  runtimeConfig: PlatformRuntimeConfig[];
  metaSetup: MetaSetupInfo;
  showMetaAdminGuide: boolean;
  flashParams?: { connected?: string; error?: string };
}) {
  const router = useRouter();
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [connections, setConnections] = useState(initialConnections);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "connected">("all");

  const flash = flashParams ? flashMessage(flashParams) : null;
  const brandConnections = connections.filter((item) => item.brandId === brandId);
  const configById = useMemo(
    () => new Map(runtimeConfig.map((item) => [item.id, item])),
    [runtimeConfig],
  );

  const connectedCount = brandConnections.length;
  const liveOAuthCount = runtimeConfig.filter((item) => item.oauthConfigured).length;

  async function connectDemo(platform: IntegrationPlatformId) {
    if (!brandId) return;
    setLoadingKey(`demo:${platform}`);

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
      setLoadingKey(null);
    }
  }

  async function disconnect(connectionId: string) {
    setLoadingKey(`disconnect:${connectionId}`);
    try {
      const response = await fetch(`/api/connections?id=${connectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConnections((prev) => prev.filter((item) => item.id !== connectionId));
        router.refresh();
      }
    } finally {
      setLoadingKey(null);
    }
  }

  function connectOAuth(platform: IntegrationPlatformId) {
    if (!brandId) return;

    if (platform === "linkedin") {
      window.location.href = `/api/social/linkedin/connect?brandId=${brandId}`;
      return;
    }

    if (platform === "instagram" || platform === "facebook") {
      window.location.href = `/api/social/meta/connect?brandId=${brandId}&platform=${platform}`;
    }
  }

  function oauthReady(platform: IntegrationPlatformId) {
    return configById.get(platform)?.connectionMode === "oauth";
  }

  const grouped = (Object.keys(INTEGRATION_CATEGORIES) as IntegrationCategory[]).map(
    (category) => ({
      category,
      platforms: INTEGRATION_PLATFORMS.filter((platform) => {
        if (platform.category !== category) return false;
        if (filter === "connected") {
          return brandConnections.some((item) => item.platform === platform.id);
        }
        return true;
      }),
    }),
  ).filter((group) => group.platforms.length > 0);

  if (brands.length === 0) {
    return (
      <PanelCard
        title="Add a brand first"
        description="Integrations connect publishing channels to each brand in your workspace."
      >
        <p className="text-sm text-gray-body">
          Complete onboarding or add a brand, then come back here to connect LinkedIn,
          Instagram, Facebook, and more.
        </p>
      </PanelCard>
    );
  }

  return (
    <div className="space-y-6">
      {flash ? (
        <div className="rounded-xl border border-gold/25 bg-cream/60 px-4 py-3 text-sm text-near-black">
          {flash}
        </div>
      ) : null}

      <MetaSetupGuide setup={metaSetup} showAdminGuide={showMetaAdminGuide} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            Connected
          </p>
          <p className="mt-2 font-playfair text-3xl italic text-near-black">
            {connectedCount}
          </p>
          <p className="mt-1 text-sm text-gray-body">channels for this brand</p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            Live OAuth
          </p>
          <p className="mt-2 font-playfair text-3xl italic text-near-black">
            {liveOAuthCount}
          </p>
          <p className="mt-1 text-sm text-gray-body">channels ready to connect</p>
        </div>
        <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
            Demo mode
          </p>
          <p className="mt-2 font-playfair text-3xl italic text-near-black">On</p>
          <p className="mt-1 text-sm text-gray-body">test publishing without live APIs</p>
        </div>
      </div>

      <PanelCard
        title="Brand"
        description="Each brand has its own channel connections."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md">
            <label className="text-sm font-medium text-near-black" htmlFor="integration-brand">
              Active brand
            </label>
            <select
              id="integration-brand"
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-near-black"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {(["all", "connected"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  filter === value
                    ? "bg-cream text-near-black shadow-sm"
                    : "text-gray-body hover:bg-cream/70",
                )}
              >
                {value === "all" ? "All platforms" : "Connected only"}
              </button>
            ))}
          </div>
        </div>
      </PanelCard>

      {grouped.map(({ category, platforms }) => (
        <section key={category} className="space-y-4">
          <div>
            <h2 className="font-playfair text-2xl italic text-near-black">
              {INTEGRATION_CATEGORIES[category].label}
            </h2>
            <p className="mt-1 text-sm text-gray-body">
              {INTEGRATION_CATEGORIES[category].description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {platforms.map((platform) => {
              const connection = brandConnections.find(
                (item) => item.platform === platform.id,
              );
              const runtime = configById.get(platform.id);
              const isLoading =
                loadingKey === `demo:${platform.id}` ||
                loadingKey === `disconnect:${connection?.id}`;

              return (
                <article
                  key={platform.id}
                  className="flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-5 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide",
                          PLATFORM_ACCENTS[platform.id],
                        )}
                      >
                        {platform.name.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-playfair text-lg italic text-near-black">
                          {platform.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-body">{platform.tagline}</p>
                      </div>
                    </div>
                    {connection ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-gold" />
                    ) : (
                      <Plug className="h-5 w-5 shrink-0 text-gray-label" />
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-[0.65rem] font-medium uppercase tracking-wide text-gray-label">
                    <span>{platform.charLimit.toLocaleString()} chars</span>
                    <span>·</span>
                    <span>{platform.supportsImages ? "Images" : "Text/video"}</span>
                    <span>·</span>
                    <span>
                      {runtime?.connectionMode === "oauth"
                        ? "OAuth ready"
                        : runtime?.connectionMode === "demo"
                          ? "Demo ready"
                          : "Unavailable"}
                    </span>
                  </div>

                  {platform.id === "instagram" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Requires an Instagram Business or Creator account.
                    </p>
                  ) : null}

                  {connection ? (
                    <div className="mt-5 flex flex-1 flex-col justify-end space-y-3">
                      <p className="text-sm text-near-black">
                        {connection.accountName}
                        {connection.isDemo ? (
                          <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-gray-label">
                            Demo
                          </span>
                        ) : (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-emerald-700">
                            Live
                          </span>
                        )}
                      </p>
                      <TextureButton
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => void disconnect(connection.id)}
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Disconnect
                      </TextureButton>
                    </div>
                  ) : (
                    <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
                      {platform.oauthProvider || platform.id === "linkedin" ? (
                        <>
                          <TextureButton
                            type="button"
                            variant="primary"
                            size="sm"
                            disabled={isLoading || !oauthReady(platform.id)}
                            onClick={() => connectOAuth(platform.id)}
                          >
                            <Link2 className="mr-2 h-4 w-4" />
                            Connect {platform.name}
                          </TextureButton>
                          {!oauthReady(platform.id) ? (
                            <p className="text-xs text-gray-body">
                              {platform.id === "instagram" || platform.id === "facebook"
                                ? "Live connect isn't enabled yet. Use demo mode below to preview."
                                : "Live connect isn't enabled yet. Use demo mode below to preview."}
                            </p>
                          ) : null}
                        </>
                      ) : null}
                      {platform.demoAvailable ? (
                        <TextureButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => void connectDemo(platform.id)}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Try demo mode
                        </TextureButton>
                      ) : (
                        <p className="text-xs text-gray-label">Coming soon</p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
