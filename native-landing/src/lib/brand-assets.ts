import axios from "axios";
import * as cheerio from "cheerio";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export type BrandVisualAssets = {
  logoUrl: string;
  siteImageUrl: string | null;
};

export type BrandResearchAssets = {
  logoUrl?: string | null;
  siteImageUrl?: string | null;
};

function absoluteUrl(value: string | undefined, baseUrl: string) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function isIconAssetUrl(url: string) {
  return /favicon|apple-touch-icon|s2\/favicons|faviconV2|gstatic\.com\/favicon|\/icon(?:-\d+)?\.(?:png|ico|svg)/i.test(
    url,
  );
}

function heroDiscoveryCandidates(websiteUrl: string, pageUrl: string) {
  try {
    const base = new URL(pageUrl);
    const root = new URL(websiteUrl);
    const hosts = Array.from(
      new Set([base.hostname, root.hostname, `www.${root.hostname.replace(/^www\./, "")}`]),
    );
    const paths = ["/og-image.png", "/og.png", "/opengraph-image.png", "/social-share.png"];
    const urls: string[] = [];
    for (const host of hosts) {
      for (const path of paths) {
        urls.push(new URL(path, `${base.protocol}//${host}`).toString());
      }
    }
    return urls;
  } catch {
    return [];
  }
}

function logoDiscoveryCandidates(websiteUrl: string, pageUrl: string) {
  try {
    const base = new URL(pageUrl);
    const root = new URL(websiteUrl);
    const hosts = Array.from(
      new Set([base.hostname, root.hostname, `www.${root.hostname.replace(/^www\./, "")}`]),
    );
    const paths = ["/favicon.png", "/apple-touch-icon.png", "/favicon.ico"];
    const urls: string[] = [];
    for (const host of hosts) {
      for (const path of paths) {
        urls.push(new URL(path, `${base.protocol}//${host}`).toString());
      }
    }
    return urls;
  } catch {
    return [];
  }
}

async function isValidImageUrl(url: string) {
  try {
    const response = await axios.head(url, {
      timeout: 8_000,
      maxRedirects: 5,
      headers: {
        "User-Agent": "KerygmaSocialCrawler/1.0 (+https://kerygmasocial.com)",
        Accept: "image/*,*/*;q=0.8",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });
    const contentType = String(response.headers["content-type"] ?? "");
    return contentType.startsWith("image/");
  } catch {
    return false;
  }
}

async function pickFirstValidImage(
  candidates: Array<string | null | undefined>,
  options?: { allowIcons?: boolean },
) {
  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (!candidate || seen.has(candidate)) continue;
    if (!options?.allowIcons && isIconAssetUrl(candidate)) continue;
    seen.add(candidate);
    if (await isValidImageUrl(candidate)) {
      return candidate;
    }
  }
  return null;
}


export function extractAssetsFromHtml(html: string, pageUrl: string) {
  const $ = cheerio.load(html);

  const siteImageUrl =
    absoluteUrl($('meta[property="og:image"]').attr("content"), pageUrl) ??
    absoluteUrl($('meta[property="og:image:url"]').attr("content"), pageUrl) ??
    absoluteUrl($('meta[name="twitter:image"]').attr("content"), pageUrl);

  const iconHref =
    $('link[rel="apple-touch-icon"]').attr("href") ??
    $('link[rel="apple-touch-icon-precomposed"]').attr("href") ??
    $('link[rel="icon"][sizes="192x192"]').attr("href") ??
    $('link[rel="icon"][sizes="128x128"]').attr("href") ??
    $('link[rel="icon"]').attr("href") ??
    $('link[rel="shortcut icon"]').attr("href");

  const logoUrl =
    absoluteUrl(iconHref, pageUrl) ??
    absoluteUrl($('meta[property="og:logo"]').attr("content"), pageUrl);

  return { logoUrl, siteImageUrl };
}

export async function fetchBrandAssetsFromWebsite(
  websiteUrl: string,
): Promise<BrandVisualAssets | null> {
  const normalized = normalizeWebsiteUrl(websiteUrl);
  if (!normalized) return null;

  try {
    const response = await axios.get<string>(normalized, {
      timeout: 12_000,
      headers: {
        "User-Agent": "KerygmaSocialCrawler/1.0 (+https://kerygmasocial.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const contentType = String(response.headers["content-type"] ?? "");
    if (!contentType.includes("text/html")) return null;

    const assets = extractAssetsFromHtml(response.data, normalized);
    const logoUrl =
      (await pickFirstValidImage(
        [
          assets.logoUrl,
          ...logoDiscoveryCandidates(normalized, normalized),
        ],
        { allowIcons: true },
      )) ??
      "";

    const siteImageUrl = await pickFirstValidImage(
      [
        assets.siteImageUrl,
        ...heroDiscoveryCandidates(normalized, normalized),
      ],
      { allowIcons: false },
    );

    return { logoUrl, siteImageUrl };
  } catch {
    return null;
  }
}

function sanitizedResearchLogo(logoUrl?: string | null) {
  if (!logoUrl?.trim()) return "";
  // Google favicon proxies often 404 for sites without icons — don't store/serve them.
  if (/s2\/favicons|faviconV2|gstatic\.com\/favicon/i.test(logoUrl)) return "";
  return logoUrl.trim();
}

export function getBrandAssetsFromResearch(
  websiteUrl: string,
  research?: BrandResearchAssets | null,
): BrandVisualAssets {
  return {
    logoUrl: sanitizedResearchLogo(research?.logoUrl),
    siteImageUrl: research?.siteImageUrl ?? null,
  };
}

export async function resolveBrandAssets(
  websiteUrl: string,
  research?: BrandResearchAssets | null,
): Promise<BrandVisualAssets> {
  const cached = getBrandAssetsFromResearch(websiteUrl, research);
  const logoUrl =
    (cached.logoUrl &&
      (await pickFirstValidImage([cached.logoUrl], { allowIcons: true }))) ||
    "";

  const cachedSiteImage = await pickFirstValidImage([cached.siteImageUrl], {
    allowIcons: false,
  });
  if (cachedSiteImage) {
    return { logoUrl, siteImageUrl: cachedSiteImage };
  }

  const fetched = await fetchBrandAssetsFromWebsite(websiteUrl);
  if (!fetched) {
    return { logoUrl, siteImageUrl: null };
  }

  return {
    logoUrl: logoUrl || fetched.logoUrl,
    siteImageUrl: fetched.siteImageUrl,
  };
}
