import {
  INTEGRATION_PLATFORMS,
  type IntegrationPlatformId,
} from "@/lib/integrations/catalog";
import {
  isFacebookConfigured,
  isInstagramConfigured,
} from "@/lib/social/meta";

export type PlatformConnectionMode = "oauth" | "demo" | "unavailable";

export type PlatformRuntimeConfig = {
  id: IntegrationPlatformId;
  oauthConfigured: boolean;
  connectionMode: PlatformConnectionMode;
};

function isLinkedInConfigured() {
  return Boolean(
    process.env.LINKEDIN_CLIENT_ID?.trim() &&
      process.env.LINKEDIN_CLIENT_SECRET?.trim(),
  );
}

function isMetaOAuthConfigured(platformId: IntegrationPlatformId) {
  if (platformId === "instagram") return isInstagramConfigured();
  if (platformId === "facebook") return isFacebookConfigured();
  return false;
}

export function getPlatformRuntimeConfig(
  platformId: IntegrationPlatformId,
): PlatformRuntimeConfig {
  const platform = INTEGRATION_PLATFORMS.find((item) => item.id === platformId)!;

  if (platform.oauthProvider === "linkedin") {
    const oauthConfigured = isLinkedInConfigured();
    return {
      id: platformId,
      oauthConfigured,
      connectionMode: oauthConfigured ? "oauth" : platform.demoAvailable ? "demo" : "unavailable",
    };
  }

  if (platform.oauthProvider === "meta") {
    const oauthConfigured = isMetaOAuthConfigured(platformId);
    return {
      id: platformId,
      oauthConfigured,
      connectionMode: oauthConfigured ? "oauth" : platform.demoAvailable ? "demo" : "unavailable",
    };
  }

  return {
    id: platformId,
    oauthConfigured: false,
    connectionMode: platform.demoAvailable ? "demo" : "unavailable",
  };
}

export function getIntegrationsRuntimeConfig() {
  return INTEGRATION_PLATFORMS.map((platform) =>
    getPlatformRuntimeConfig(platform.id),
  );
}

export function getIntegrationProvidersSummary() {
  return {
    linkedin: isLinkedInConfigured(),
    instagram: isInstagramConfigured(),
    facebook: isFacebookConfigured(),
  };
}
