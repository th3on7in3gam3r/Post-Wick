export const PENDING_WEBSITE_URL_KEY = "postwick_website_url";
export const HERO_ONBOARDING_KEY = "postwick_hero_onboarding";

export function savePendingWebsiteUrl(url: string) {
  sessionStorage.setItem(PENDING_WEBSITE_URL_KEY, url);
}

export function markHeroOnboardingIntent() {
  sessionStorage.setItem(HERO_ONBOARDING_KEY, "1");
}

export function peekPendingWebsiteUrl() {
  return sessionStorage.getItem(PENDING_WEBSITE_URL_KEY);
}

export function consumeHeroOnboardingIntent() {
  const hero = sessionStorage.getItem(HERO_ONBOARDING_KEY) === "1";
  sessionStorage.removeItem(HERO_ONBOARDING_KEY);
  return hero;
}

export function clearPendingWebsiteUrl() {
  sessionStorage.removeItem(PENDING_WEBSITE_URL_KEY);
  sessionStorage.removeItem(HERO_ONBOARDING_KEY);
}

export function consumePendingWebsiteUrl(): string | null {
  const stored = sessionStorage.getItem(PENDING_WEBSITE_URL_KEY);
  if (!stored) return null;
  sessionStorage.removeItem(PENDING_WEBSITE_URL_KEY);
  return stored;
}

export function onboardingRedirectFromHeroUrl(url: string) {
  return `/onboarding?add=1&url=${encodeURIComponent(url)}`;
}

export const HERO_LAUNCH_PATHS = {
  preparing: "/preparing-your-workspace",
  ready: "/youre-in",
} as const;
