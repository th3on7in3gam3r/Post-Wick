export const SITE_NAME = "Kerygma Social";

export const SITE_TAGLINE = "One URL. Endless Content.";

export const BIBLEFUNLAND_STUDIOS_URL = "https://www.biblefunlandstudios.com/";

export const SITE_SLOGAN_PARTS = ["One URL", "Endless Content"] as const;

export const SITE_DESCRIPTION =
  "Drop your URL. We research your brand and generate posts for your approval. One URL. Endless Content.";

export const OG_DEFAULT_TITLE =
  "Social Media Autopilot for Local Businesses | Kerygma Social";

export const OG_DEFAULT_DESCRIPTION =
  "Transform your URL into a month of playful, high-converting social posts in just 5 minutes. Autopilot posting for local shops, gyms, and studios. Try it free!";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Kerygma Social — Social media on autopilot for local businesses",
} as const;

export function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "").replace(/\.+$/, "");
}

export function siteUrl() {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://kerygmasocial.com",
  );
}
