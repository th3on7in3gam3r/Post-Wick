"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Link2,
  Loader2,
  Plug,
  Sparkles,
} from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { PanelCard } from "@/components/app/panel-card";
import { MetaSetupGuide, type MetaSetupInfo } from "@/components/app/meta-setup-guide";
import { OAuthDebugPanel } from "@/components/app/oauth-debug-panel";
import { XSetupGuide, type XSetupInfo } from "@/components/app/x-setup-guide";
import { TextureButton } from "@/components/ui/texture-button";
import type { OAuthDebugInfo } from "@/lib/integrations/oauth-debug";
import {
  INTEGRATION_CATEGORIES,
  INTEGRATION_PLATFORMS,
  type IntegrationCategory,
  type IntegrationPlatformId,
} from "@/lib/integrations/catalog";
import type { PlatformRuntimeConfig } from "@/lib/integrations/config";
import { cn } from "@/lib/utils";

type OAuthRedirectSetup = {
  redirectUri: string;
  appUrl: string;
};

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
  healthStatus?: "ok" | "error";
  lastHealthError?: string | null;
};

const PLATFORM_ACCENTS: Record<IntegrationPlatformId, string> = {
  linkedin: "bg-[#0A66C2]/10 text-[#0A66C2]",
  instagram: "bg-[#E4405F]/10 text-[#E4405F]",
  facebook: "bg-[#1877F2]/10 text-[#1877F2]",
  twitter: "bg-black/10 text-near-black",
  tiktok: "bg-black/10 text-near-black",
  pinterest: "bg-[#BD081C]/10 text-[#BD081C]",
  bluesky: "bg-[#1185FE]/10 text-[#1185FE]",
  google_business: "bg-[#4285F4]/10 text-[#4285F4]",
};

type FlashResult =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

function flashFromParams(searchParams: {
  connected?: string;
  error?: string;
  detail?: string;
}): FlashResult {
  if (searchParams.connected === "linkedin") {
    return {
      kind: "success",
      message: "LinkedIn connected. Approved posts can publish when they are due.",
    };
  }
  if (searchParams.connected === "instagram") {
    return {
      kind: "success",
      message: "Instagram connected. Image posts can publish to your Business account.",
    };
  }
  if (searchParams.connected === "facebook") {
    return {
      kind: "success",
      message: "Facebook Page connected. Text and image posts can publish when they are due.",
    };
  }
  if (searchParams.connected === "twitter") {
    return {
      kind: "success",
      message: "X connected. Text and image posts can publish when they are due.",
    };
  }
  if (searchParams.connected === "pinterest") {
    return {
      kind: "success",
      message:
        "Pinterest connected. Image posts will pin to your selected board when they are due.",
    };
  }
  if (searchParams.connected === "bluesky") {
    return {
      kind: "success",
      message: "Bluesky connected. Approved posts can publish when they are due.",
    };
  }

  const errorMessages: Record<string, string> = {
    invalid_callback_missing_params:
      "Meta returned to Kerygma without an authorization code or state. The OAuth flow was likely interrupted.",
    invalid_callback_missing_code:
      "Meta returned without an authorization code. The login may have been cancelled, or the redirect URI may not match Meta settings.",
    invalid_callback_missing_state:
      "Meta returned without a valid state parameter. Start a fresh Connect attempt from this page.",
    invalid_callback_bad_state:
      "The OAuth state from Meta was unexpected. Start a fresh Connect attempt from this page.",
    invalid_callback:
      "The OAuth callback was incomplete. Click Connect again and finish the Meta login without closing the tab.",
    meta_access_denied:
      "Meta authorization was cancelled or permissions were denied. Try again and approve all requested permissions.",
    meta_oauth_error: "Meta returned an OAuth error during login.",
    brand_not_found:
      "The brand for this connection was not found. Select your brand on this page and try again.",
    linkedin_exchange_failed:
      "LinkedIn authorization failed during token exchange. See the debug details below.",
    linkedin_oauth_error:
      "LinkedIn rejected the OAuth request. See the debug details below — usually a redirect URI mismatch.",
    meta_no_pages:
      "No Facebook Page was found on this account. Create or admin a Page, then try again.",
    meta_no_instagram:
      "No Instagram Business account is linked to your Facebook Page. Link them in Meta Business Suite, then try again.",
    meta_exchange_failed:
      "Meta authorization failed during token exchange. See the debug details below.",
    x_exchange_failed:
      "X authorization failed. Confirm your app callback URL matches the developer portal.",
    pinterest_exchange_failed:
      "Pinterest authorization failed. Confirm your app credentials and redirect URI.",
    pinterest_no_boards:
      "No Pinterest boards were found on this account. Create a board on Pinterest, then try again.",
    bluesky_exchange_failed:
      "Bluesky authorization failed. For local testing use http://127.0.0.1, and confirm your handle.",
    bluesky_oauth_error:
      "Bluesky rejected the OAuth request. Try again and approve the requested permissions.",
  };

  if (searchParams.error) {
    return {
      kind: "error",
      message:
        errorMessages[searchParams.error] ??
        (searchParams.detail
          ? searchParams.detail
          : "Connection failed. Please try again."),
    };
  }

  return null;
}

function oauthConnectUrl(platform: IntegrationPlatformId, brandId: string) {
  const id = encodeURIComponent(brandId);
  if (platform === "linkedin") {
    return `/api/social/linkedin/connect?brandId=${id}`;
  }
  if (platform === "instagram" || platform === "facebook") {
    return `/api/social/meta/connect?brandId=${id}&platform=${platform}`;
  }
  if (platform === "twitter") {
    return `/api/social/x/connect?brandId=${id}`;
  }
  if (platform === "pinterest") {
    return `/api/social/pinterest/connect?brandId=${id}`;
  }
  if (platform === "bluesky") {
    return `/settings/integrations/bluesky/connect?brandId=${id}`;
  }
  return null;
}

function connectErrorMessage(data: unknown) {
  if (typeof data === "object" && data && "error" in data) {
    const error = (data as { error?: unknown }).error;
    if (typeof error === "string") return error;
  }
  return "Could not connect this channel. Try again.";
}

function DemoModeToggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Demo mode"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-black/15",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

export function IntegrationsClient({
  brands,
  initialConnections,
  initialDemoModeEnabled,
  runtimeConfig,
  metaSetup,
  xSetup,
  linkedInSetup,
  showMetaAdminGuide,
  showXAdminGuide,
  flashParams,
  oauthDebug,
}: {
  brands: Brand[];
  initialConnections: Connection[];
  initialDemoModeEnabled: boolean;
  runtimeConfig: PlatformRuntimeConfig[];
  metaSetup: MetaSetupInfo;
  xSetup: XSetupInfo;
  linkedInSetup: OAuthRedirectSetup;
  showMetaAdminGuide: boolean;
  showXAdminGuide: boolean;
  flashParams?: { connected?: string; error?: string; detail?: string };
  oauthDebug?: OAuthDebugInfo | null;
}) {
  const router = useRouter();
  const { activeClient, setActiveClientId } = useActiveClient();
  const [brandId, setBrandId] = useState(
    () => activeClient.id || brands[0]?.id || "",
  );
  const [connections, setConnections] = useState(initialConnections);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "connected">("all");
  const [actionError, setActionError] = useState<string | null>(null);
  const [verifyFeedback, setVerifyFeedback] = useState<
    Record<string, { kind: "success" | "error"; message: string }>
  >({});
  const [demoModeEnabled, setDemoModeEnabled] = useState(initialDemoModeEnabled);
  const [demoModeSaving, setDemoModeSaving] = useState(false);

  useEffect(() => {
    if (activeClient.id && brands.some((brand) => brand.id === activeClient.id)) {
      setBrandId(activeClient.id);
    }
  }, [activeClient.id, brands]);

  const flash = flashParams ? flashFromParams(flashParams) : null;
  const showOAuthDebug =
    Boolean(oauthDebug) || flash?.kind === "error";
  const oauthRedirectUri =
    oauthDebug?.flow === "linkedin"
      ? linkedInSetup.redirectUri
      : oauthDebug?.flow === "x"
        ? xSetup.redirectUri
        : metaSetup.redirectUri;
  const activeBrand = brands.find((brand) => brand.id === brandId);
  const brandConnections = connections.filter((item) => item.brandId === brandId);
  const configById = useMemo(
    () => new Map(runtimeConfig.map((item) => [item.id, item])),
    [runtimeConfig],
  );

  const connectedCount = brandConnections.length;
  const liveOAuthCount = runtimeConfig.filter((item) => item.oauthConfigured).length;
  const demoConnectionCount = brandConnections.filter((item) => item.isDemo).length;

  async function updateDemoModeEnabled(enabled: boolean) {
    const previous = demoModeEnabled;
    setDemoModeEnabled(enabled);
    setDemoModeSaving(true);
    setActionError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demoModeEnabled: enabled }),
      });
      const data = await response.json();
      if (!response.ok) {
        setDemoModeEnabled(previous);
        setActionError(connectErrorMessage(data));
      }
    } catch {
      setDemoModeEnabled(previous);
      setActionError("Could not update demo mode. Try again.");
    } finally {
      setDemoModeSaving(false);
    }
  }

  async function connectDemo(platform: IntegrationPlatformId) {
    if (!demoModeEnabled) {
      setActionError("Turn on demo mode to preview channels without live OAuth.");
      return;
    }
    if (!brandId) {
      setActionError("Select a brand before connecting.");
      return;
    }
    setActionError(null);
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
        return;
      }
      setActionError(connectErrorMessage(data));
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

  async function verifyConnection(connectionId: string, platformLabel: string) {
    setLoadingKey(`verify:${connectionId}`);

    try {
      const response = await fetch(`/api/connections/${connectionId}/verify`, {
        method: "POST",
        credentials: "same-origin",
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        refreshed?: boolean;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not verify this connection",
        );
      }

      setConnections((prev) =>
        prev.map((item) =>
          item.id === connectionId
            ? {
                ...item,
                healthStatus: data.ok ? "ok" : "error",
                lastHealthError: data.ok ? null : data.error ?? "Connection check failed",
              }
            : item,
        ),
      );

      if (!data.ok && data.error) {
        setVerifyFeedback((prev) => ({
          ...prev,
          [connectionId]: { kind: "error", message: data.error! },
        }));
      } else if (data.ok) {
        setVerifyFeedback((prev) => ({
          ...prev,
          [connectionId]: {
            kind: "success",
            message: data.refreshed
              ? `${platformLabel} connection is healthy. Access token was refreshed.`
              : `${platformLabel} connection looks good and is ready to publish.`,
          },
        }));
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not verify this connection";
      setVerifyFeedback((prev) => ({
        ...prev,
        [connectionId]: { kind: "error", message },
      }));
    } finally {
      setLoadingKey(null);
    }
  }

  async function connectOAuth(platform: IntegrationPlatformId) {
    if (!brandId) {
      setActionError("Select a brand before connecting.");
      return;
    }

    const url = oauthConnectUrl(platform, brandId);
    if (!url) return;

    setActionError(null);
    setLoadingKey(`oauth:${platform}`);

    // Bluesky uses a handle form page (not a direct API OAuth redirect).
    if (platform === "bluesky") {
      window.location.assign(url);
      return;
    }

    try {
      const response = await fetch(url, {
        redirect: "manual",
        credentials: "include",
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (location) {
          window.location.assign(location);
          return;
        }
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        setActionError(connectErrorMessage(data));
        return;
      }

      window.location.assign(url);
    } catch {
      window.location.assign(url);
    } finally {
      setLoadingKey(null);
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
      {flash?.kind === "success" ? (
        <div className="rounded-xl border border-gold/25 bg-cream/60 px-4 py-3 text-sm text-near-black">
          {flash.message}
        </div>
      ) : null}

      {flash?.kind === "error" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {flash.message}
        </div>
      ) : null}

      {showOAuthDebug && flash?.kind !== "success" ? (
        <OAuthDebugPanel
          errorCode={flashParams?.error}
          detail={flashParams?.detail}
          debug={oauthDebug}
          redirectUri={oauthRedirectUri}
          showAdminLinks={showMetaAdminGuide || showXAdminGuide}
        />
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {actionError}
        </div>
      ) : null}

      <MetaSetupGuide setup={metaSetup} showAdminGuide={showMetaAdminGuide} />
      <XSetupGuide setup={xSetup} showAdminGuide={showXAdminGuide} />

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
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
              Demo mode
            </p>
            <DemoModeToggle
              checked={demoModeEnabled}
              disabled={demoModeSaving}
              onChange={(enabled) => void updateDemoModeEnabled(enabled)}
            />
          </div>
          <p className="mt-2 font-playfair text-3xl italic text-near-black">
            {demoModeEnabled ? "On" : "Off"}
          </p>
          <p className="mt-1 text-sm text-gray-body">
            {demoModeEnabled
              ? "Try demo connections on platforms without live OAuth."
              : "Enable to test publishing without live APIs."}
          </p>
          {!demoModeEnabled && demoConnectionCount > 0 ? (
            <p className="mt-2 text-xs text-gray-body">
              {demoConnectionCount} demo connection{demoConnectionCount === 1 ? "" : "s"} still
              active for this brand.
            </p>
          ) : null}
        </div>
      </div>

      <PanelCard
        title="Brand"
        description="Each brand has its own channel connections. This follows the workspace you pick in the sidebar."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full max-w-md">
            <label className="text-sm font-medium text-near-black" htmlFor="integration-brand">
              My brands
            </label>
            <select
              id="integration-brand"
              value={brandId}
              onChange={(event) => {
                const nextBrandId = event.target.value;
                setBrandId(nextBrandId);
                setActiveClientId(nextBrandId);
              }}
              className="mt-2 w-full rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-sm text-near-black"
            >
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {activeBrand ? (
              <p className="mt-2 text-xs text-gray-body">
                Connecting channels for <strong className="text-near-black">{activeBrand.name}</strong>.
              </p>
            ) : null}
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
                loadingKey === `oauth:${platform.id}` ||
                loadingKey === `disconnect:${connection?.id}` ||
                loadingKey === `verify:${connection?.id}`;

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

                  {platform.id === "facebook" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Requires a Facebook Page you administer. Image posts need Fix images on
                      the brand page first.
                    </p>
                  ) : null}

                  {platform.id === "instagram" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Requires an Instagram Business or Creator account.
                    </p>
                  ) : null}

                  {platform.id === "twitter" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Connect the X account that should publish approved posts. Image posts
                      need Fix images on the brand page first.
                    </p>
                  ) : null}

                  {platform.id === "pinterest" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Pins require an image. Connect a board you manage, then use Fix images
                      on the brand page before publishing.
                    </p>
                  ) : null}

                  {platform.id === "bluesky" && !connection ? (
                    <p className="mt-3 text-xs text-gray-body">
                      Enter your Bluesky handle, then approve Kerygma Social via AT Protocol
                      OAuth. Image posts need Fix images on the brand page first.
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
                      {!connection.isDemo && connection.healthStatus === "ok" && !verifyFeedback[connection.id] ? (
                        <p className="text-xs text-emerald-700">Connection verified and ready to publish.</p>
                      ) : null}
                      {!connection.isDemo && connection.healthStatus === "error" && !verifyFeedback[connection.id] ? (
                        <p className="text-xs text-red-600">
                          {connection.lastHealthError ??
                            "This connection needs to be checked or reconnected."}
                        </p>
                      ) : null}
                      {verifyFeedback[connection.id] ? (
                        <p
                          className={cn(
                            "text-xs leading-relaxed",
                            verifyFeedback[connection.id]?.kind === "success"
                              ? "text-emerald-700"
                              : "text-red-600",
                          )}
                        >
                          {verifyFeedback[connection.id]?.message}
                        </p>
                      ) : null}
                      <div className="flex flex-wrap gap-2">
                        {!connection.isDemo ? (
                          <TextureButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => void verifyConnection(connection.id, platform.name)}
                          >
                            {loadingKey === `verify:${connection.id}` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Check connection
                          </TextureButton>
                        ) : null}
                        <TextureButton
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => void disconnect(connection.id)}
                        >
                          {loadingKey === `disconnect:${connection.id}` ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Disconnect
                        </TextureButton>
                      </div>
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
                            onClick={() => void connectOAuth(platform.id)}
                          >
                            {isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Link2 className="mr-2 h-4 w-4" />
                            )}
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
                      {platform.demoAvailable && demoModeEnabled && !oauthReady(platform.id) ? (
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
                      ) : !platform.demoAvailable ? (
                        <p className="text-xs text-gray-label">Coming soon</p>
                      ) : !demoModeEnabled && !oauthReady(platform.id) ? (
                        <p className="text-xs text-gray-body">
                          Turn on demo mode above to preview this channel.
                        </p>
                      ) : null}
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
