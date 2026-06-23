export const SITE_NAME = "Post-Wick";

export const SITE_TAGLINE = "Light your feed. We tend the wick.";

export const SITE_DESCRIPTION =
  "Drop your URL and we'll generate 50 posts for you. Light your feed — we tend the wick.";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://post-wick.vercel.app").replace(
    /\/+$/,
    "",
  );
}
