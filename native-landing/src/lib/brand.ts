export const SITE_NAME = "Kerygma Social";

export const SITE_TAGLINE = "One URL. Endless Content.";

export const BIBLEFUNLAND_STUDIOS_URL = "https://www.biblefunlandstudios.com/";

export const SITE_SLOGAN_PARTS = ["One URL", "Endless Content"] as const;

export const SITE_DESCRIPTION =
  "Drop your URL. We research your brand and generate posts for your approval. One URL. Endless Content.";

export const OG_DEFAULT_TITLE =
  "Kerygma Social | Social media on autopilot for local businesses";

export const OG_DEFAULT_DESCRIPTION =
  "Drop your URL. We research your brand and generate posts. Swipe to approve. Publish on autopilot.";

export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Kerygma Social — Social media on autopilot for local businesses",
} as const;

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://post-wick.vercel.app").replace(
    /\/+$/,
    "",
  );
}
