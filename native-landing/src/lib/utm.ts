import { siteUrl } from "@/lib/brand";

/** Preferred Growth Stack / Pulse sources (lowercase). */
export type UtmSource = "cadence" | "kerygma" | "citepilot" | (string & {});

export type UtmMedium = "email" | "social" | "cpc" | "referral" | (string & {});

export type UtmParams = {
  source: UtmSource;
  campaign: string;
  medium?: UtmMedium;
  content?: string;
};

function slugifyCampaign(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Appends utm_* params without stripping existing query params.
 * Relative paths resolve against the public site URL.
 */
export function withUtm(url: string, params: UtmParams): string {
  const base = siteUrl();
  const parsed = new URL(url, `${base}/`);

  const source = params.source.trim().toLowerCase();
  const campaign = slugifyCampaign(params.campaign);
  if (source) parsed.searchParams.set("utm_source", source);
  if (campaign) parsed.searchParams.set("utm_campaign", campaign);

  if (params.medium?.trim()) {
    parsed.searchParams.set("utm_medium", params.medium.trim().toLowerCase());
  }
  if (params.content?.trim()) {
    parsed.searchParams.set(
      "utm_content",
      slugifyCampaign(params.content),
    );
  }

  return parsed.toString();
}

/** Absolute site URL + path with UTM tagging for emails and share links. */
export function siteUrlWithUtm(path: string, params: UtmParams): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return withUtm(`${siteUrl()}${normalized}`, params);
}

/**
 * Same-site path + query with UTMs (keeps existing params).
 * Prefer this for Next.js <Link href> values.
 */
export function pathWithUtm(path: string, params: UtmParams): string {
  const absolute = siteUrlWithUtm(path, params);
  const parsed = new URL(absolute);
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/** Cadence / AI CMO → Kerygma landing (use when building campaign CTAs). */
export function cadenceSiteUrl(campaign: string, extras?: Omit<UtmParams, "source" | "campaign">) {
  return siteUrlWithUtm("/", {
    source: "cadence",
    campaign,
    medium: extras?.medium ?? "referral",
    content: extras?.content,
  });
}

/** CitePilot → Kerygma landing (citations / SEO attribution). */
export function citePilotSiteUrl(campaign: string, extras?: Omit<UtmParams, "source" | "campaign">) {
  return siteUrlWithUtm("/", {
    source: "citepilot",
    campaign,
    medium: extras?.medium ?? "referral",
    content: extras?.content,
  });
}
