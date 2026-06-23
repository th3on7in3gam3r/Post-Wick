export const SITE_NAME = "Post-Wick";

export const SITE_TAGLINE = "One URL. Endless Content";

export const SITE_DESCRIPTION =
  "Drop your URL and we'll generate 50 posts for you. One URL. Endless Content.";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://post-wick.vercel.app").replace(
    /\/+$/,
    "",
  );
}
