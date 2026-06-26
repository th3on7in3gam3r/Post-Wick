export type IntegrationPlatformId =
  | "linkedin"
  | "instagram"
  | "facebook"
  | "twitter"
  | "tiktok"
  | "pinterest"
  | "google_business";

export type IntegrationCategory = "professional" | "social" | "local";

export type IntegrationDefinition = {
  id: IntegrationPlatformId;
  name: string;
  tagline: string;
  category: IntegrationCategory;
  charLimit: number;
  supportsImages: boolean;
  demoAvailable: boolean;
  oauthProvider?: "linkedin" | "meta" | "x";
};

export const INTEGRATION_CATEGORIES: Record<
  IntegrationCategory,
  { label: string; description: string }
> = {
  professional: {
    label: "Professional",
    description: "Reach customers and partners on business networks.",
  },
  social: {
    label: "Social",
    description: "Share updates where your audience spends time.",
  },
  local: {
    label: "Local",
    description: "Show up in local search and maps.",
  },
};

export const INTEGRATION_PLATFORMS: IntegrationDefinition[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    tagline: "Publish professional updates to your profile or company page.",
    category: "professional",
    charLimit: 3000,
    supportsImages: true,
    demoAvailable: true,
    oauthProvider: "linkedin",
  },
  {
    id: "instagram",
    name: "Instagram",
    tagline: "Share visual posts to your Instagram Business account.",
    category: "social",
    charLimit: 2200,
    supportsImages: true,
    demoAvailable: true,
    oauthProvider: "meta",
  },
  {
    id: "facebook",
    name: "Facebook",
    tagline: "Post to the Facebook Page tied to your brand.",
    category: "social",
    charLimit: 63206,
    supportsImages: true,
    demoAvailable: true,
    oauthProvider: "meta",
  },
  {
    id: "twitter",
    name: "X",
    tagline: "Short-form updates for fast-moving conversations.",
    category: "social",
    charLimit: 280,
    supportsImages: true,
    demoAvailable: true,
    oauthProvider: "x",
  },
  {
    id: "tiktok",
    name: "TikTok",
    tagline: "Video-first content for discovery and trends.",
    category: "social",
    charLimit: 2200,
    supportsImages: false,
    demoAvailable: true,
  },
  {
    id: "pinterest",
    name: "Pinterest",
    tagline: "Pin ideas and visuals that drive long-term traffic.",
    category: "social",
    charLimit: 500,
    supportsImages: true,
    demoAvailable: true,
  },
  {
    id: "google_business",
    name: "Google Business",
    tagline: "Local updates that appear on Search and Maps.",
    category: "local",
    charLimit: 1500,
    supportsImages: true,
    demoAvailable: true,
  },
];

export function getIntegrationPlatform(id: string) {
  return INTEGRATION_PLATFORMS.find((platform) => platform.id === id);
}
