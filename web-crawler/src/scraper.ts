import { readFileSync } from "node:fs";
import * as cheerio from "cheerio";
import type { FetchResult, ScrapedPage, SelectorConfig } from "./types.js";
import {
  isBinaryUrl,
  isSameDomain,
  normalizeUrl,
} from "./url-utils.js";

export function loadSelectorConfig(path?: string): SelectorConfig {
  if (!path) return {};
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as SelectorConfig;
}

export function scrapePage(
  fetchResult: FetchResult,
  depth: number,
  seedOrigin: string,
  selectorConfig: SelectorConfig,
): ScrapedPage {
  const $ = cheerio.load(fetchResult.html);
  const pageUrl = fetchResult.url;

  const collectLinks = (selector: string) => {
    const internal: string[] = [];
    const external: string[] = [];
    const seen = new Set<string>();

    $(selector).each((_, element) => {
      const href = $(element).attr("href")?.trim();
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const normalized = normalizeUrl(href, pageUrl);
      if (!normalized || isBinaryUrl(normalized) || seen.has(normalized)) {
        return;
      }

      seen.add(normalized);
      if (isSameDomain(normalized, seedOrigin)) {
        internal.push(normalized);
      } else {
        external.push(normalized);
      }
    });

    return { internal, external };
  };

  const anchorLinks = collectLinks("a[href]");
  const headings = (tag: "h1" | "h2" | "h3") =>
    $(tag)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean);

  const paragraphs = $("p")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter(Boolean)
    .join("\n\n");

  const images = $("img")
    .map((_, el) => {
      const src = $(el).attr("src")?.trim() ?? "";
      const absolute = src ? normalizeUrl(src, pageUrl) ?? src : "";
      return {
        src: absolute,
        alt: $(el).attr("alt")?.trim() ?? "",
      };
    })
    .get()
    .filter((image) => image.src);

  return {
    url: pageUrl,
    statusCode: fetchResult.statusCode,
    title: $("title").first().text().trim(),
    metaDescription:
      $("meta[name='description']").attr("content")?.trim() ??
      $("meta[property='og:description']").attr("content")?.trim() ??
      "",
    h1: headings("h1"),
    h2: headings("h2"),
    h3: headings("h3"),
    paragraphs,
    internalLinks: anchorLinks.internal,
    externalLinks: anchorLinks.external,
    images,
    scrapedAt: new Date().toISOString(),
    responseTimeMs: fetchResult.responseTimeMs,
    depth,
    custom: extractCustomFields($, pageUrl, selectorConfig),
  };
}

function extractCustomFields(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  config: SelectorConfig,
): Record<string, string | string[]> | undefined {
  const fields: Record<string, string | string[]> = {};

  const pattern = config.patterns?.find((entry) => pageUrl.includes(entry.match));
  const selectors = {
    ...(config.default ?? {}),
    ...(pattern?.fields ?? {}),
  };

  for (const [name, selector] of Object.entries(selectors)) {
    const values = $(selector)
      .map((_, el) => {
        const element = $(el);
        return (
          element.attr("content") ??
          element.attr("datetime") ??
          element.text().replace(/\s+/g, " ").trim()
        );
      })
      .get()
      .filter(Boolean);

    if (values.length === 1) {
      fields[name] = values[0];
    } else if (values.length > 1) {
      fields[name] = values;
    }
  }

  return Object.keys(fields).length ? fields : undefined;
}

export function discoverLinks(page: ScrapedPage): string[] {
  return page.internalLinks;
}
