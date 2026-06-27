import { getIntegrationPlatform } from "@/lib/integrations/catalog";

export const GENERATE_PLATFORMS = ["linkedin", "instagram", "facebook", "pinterest"] as const;

export type GeneratePlatform = (typeof GENERATE_PLATFORMS)[number];

export function charLimitForPlatform(platform: string) {
  return getIntegrationPlatform(platform)?.charLimit ?? 280;
}

export function platformRequiresImage(platform: string) {
  const normalized = platform.toLowerCase();
  return normalized === "instagram" || normalized === "pinterest";
}

export function isSupportedGeneratePlatform(
  platform: string,
): platform is GeneratePlatform {
  return (GENERATE_PLATFORMS as readonly string[]).includes(platform);
}

export function generatePlatformLabel(platform: string) {
  return getIntegrationPlatform(platform)?.name ?? platform;
}

export function defaultGeneratePlatform(
  connectedPlatforms: string[] = [],
  preferred?: string,
): GeneratePlatform {
  if (
    preferred &&
    isSupportedGeneratePlatform(preferred)
  ) {
    return preferred;
  }

  const connected = connectedPlatforms.find((platform) =>
    isSupportedGeneratePlatform(platform),
  );
  return connected ?? "linkedin";
}
