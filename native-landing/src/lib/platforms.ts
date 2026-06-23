import { getIntegrationPlatform } from "@/lib/integrations/catalog";

export const GENERATE_PLATFORMS = ["linkedin", "instagram", "facebook"] as const;

export type GeneratePlatform = (typeof GENERATE_PLATFORMS)[number];

export function charLimitForPlatform(platform: string) {
  return getIntegrationPlatform(platform)?.charLimit ?? 280;
}

export function platformRequiresImage(platform: string) {
  return platform.toLowerCase() === "instagram";
}

export function isSupportedGeneratePlatform(
  platform: string,
): platform is GeneratePlatform {
  return (GENERATE_PLATFORMS as readonly string[]).includes(platform);
}
