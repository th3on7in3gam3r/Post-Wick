export const SITE_NAME = "Post-Wick";

export const SITE_TAGLINE = "One URL. Endless Content";

export const SITE_DESCRIPTION =
  "Drop your URL and we'll generate 50 posts for you. One URL. Endless Content.";

export const OG_DEFAULT_TITLE =
  "Post-Wick | Social media on autopilot for local businesses";

export const OG_DEFAULT_DESCRIPTION =
  "Drop your URL. We research your brand and generate a month of posts. Swipe to approve. Publish on autopilot.";

export const OG_IMAGE = {
  url: "/images/og.png",
  width: 1920,
  height: 1080,
  alt: "Post-Wick — Social media on autopilot for local businesses",
} as const;

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://post-wick.vercel.app").replace(
    /\/+$/,
    "",
  );
}
