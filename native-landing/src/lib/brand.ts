export const SITE_NAME = "Post-Wick";

export const SITE_TAGLINE = "Get more customers on autopilot.";

export const SITE_DESCRIPTION =
  "Drop your URL and we'll generate 50 posts for you. Get more customers on autopilot.";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "https://post-wick.vercel.app").replace(
    /\/+$/,
    "",
  );
}
