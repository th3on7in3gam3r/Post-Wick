export const SITE_NAME = "Kerygma Social";

export const SITE_TAGLINE = "Proclaim. Publish. Multiply.";

export const SITE_SLOGAN_PARTS = ["Proclaim", "Publish", "Multiply"] as const;

export const SITE_DESCRIPTION =
  "Drop your URL and we'll generate 50 posts for you. Proclaim. Publish. Multiply.";

export const OG_DEFAULT_TITLE =
  "Kerygma Social | Social media on autopilot for local businesses";

export const OG_DEFAULT_DESCRIPTION =
  "Drop your URL. We research your brand and generate a month of posts. Swipe to approve. Publish on autopilot.";

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
