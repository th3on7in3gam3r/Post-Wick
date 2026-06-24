import axios from "axios";
import * as cheerio from "cheerio";
import {
  buildTemplatePost,
  pillarAssignmentList,
} from "@/lib/ai/prompts";
import { extractAssetsFromHtml } from "@/lib/brand-assets";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export type CrawledPage = {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  paragraphs: string;
  logoUrl?: string | null;
  siteImageUrl?: string | null;
};

function isSameHost(seed: URL, target: URL) {
  return seed.hostname === target.hostname;
}

function isSkippable(url: string) {
  return /\.(pdf|zip|png|jpe?g|gif|webp|svg|mp4|mp3)$/i.test(url);
}

export async function crawlWebsite(seedUrl: string, maxPages = 6): Promise<CrawledPage[]> {
  const normalized = normalizeWebsiteUrl(seedUrl);
  if (!normalized) {
    throw new Error("Invalid website URL");
  }

  const seed = new URL(normalized);
  const queue = [normalized];
  const visited = new Set<string>();
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift()!;
    if (visited.has(current) || isSkippable(current)) continue;
    visited.add(current);

    try {
      const response = await axios.get<string>(current, {
        timeout: 20_000,
        headers: {
          "User-Agent": "PostWickCrawler/1.0 (+https://postwick.com)",
          Accept: "text/html,application/xhtml+xml",
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });

      const contentType = String(response.headers["content-type"] ?? "");
      if (!contentType.includes("text/html")) continue;

      const $ = cheerio.load(response.data);
      const assets = pages.length === 0 ? extractAssetsFromHtml(response.data, current) : null;
      const page: CrawledPage = {
        url: current,
        title: $("title").first().text().trim(),
        metaDescription:
          $("meta[name='description']").attr("content")?.trim() ??
          $("meta[property='og:description']").attr("content")?.trim() ??
          "",
        h1: $("h1").map((_, el) => $(el).text().trim()).get().filter(Boolean),
        h2: $("h2").map((_, el) => $(el).text().trim()).get().filter(Boolean),
        paragraphs: $("p")
          .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
          .get()
          .filter(Boolean)
          .slice(0, 12)
          .join("\n"),
        logoUrl: assets?.logoUrl,
        siteImageUrl: assets?.siteImageUrl,
      };

      pages.push(page);

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href")?.trim();
        if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
        try {
          const next = new URL(href, current).toString().replace(/\/$/, "");
          if (!isSameHost(seed, new URL(next))) return;
          if (!visited.has(next) && !queue.includes(next)) {
            queue.push(next);
          }
        } catch {
          // ignore bad URLs
        }
      });
    } catch {
      // skip failed pages
    }
  }

  return pages;
}

export function buildResearchFromCrawl(
  websiteUrl: string,
  brandName: string,
  pages: CrawledPage[],
) {
  const headings = pages.flatMap((page) => [...page.h1, ...page.h2]).filter(Boolean);
  const snippets = pages
    .map((page) => page.metaDescription || page.paragraphs.slice(0, 280))
    .filter(Boolean);

  const uniqueHeadings = Array.from(new Set(headings)).slice(0, 12);
  const topics = uniqueHeadings.slice(0, 6);

  const home = pages[0];
  const uniqueValueProposition =
    snippets[0] ||
    `${brandName} helps customers through consistent, high-quality communication.`;
  const tagline =
    home?.metaDescription?.trim() ||
    uniqueValueProposition.split(/[.!?]/)[0]?.trim() ||
    `${brandName} — growing with consistent social presence.`;

  return {
    companyName: brandName,
    websiteUrl,
    logoUrl: home?.logoUrl ?? null,
    siteImageUrl: home?.siteImageUrl ?? null,
    industry: inferIndustry(snippets.join(" ")),
    targetAudience: "Business owners and customers interested in " + brandName,
    tone: "Professional, approachable, and helpful",
    voiceDescription: snippets.slice(0, 2).join(" "),
    thingsToAvoid: [] as string[],
    keyTopics: topics.length ? topics : ["Your services", "Customer success", "Behind the scenes"],
    uniqueValueProposition,
    tagline,
    pageCount: pages.length,
    crawledPages: pages.map((page) => ({
      url: page.url,
      title: page.title,
    })),
    summary: snippets.slice(0, 3).join(" "),
    source: "website-crawl",
  };
}

function inferIndustry(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("church") || lower.includes("ministry") || lower.includes("bible")) {
    return "Faith & community";
  }
  if (lower.includes("restaurant") || lower.includes("cafe") || lower.includes("food")) {
    return "Food & hospitality";
  }
  if (lower.includes("software") || lower.includes("saas") || lower.includes("app")) {
    return "Technology";
  }
  if (lower.includes("fitness") || lower.includes("gym") || lower.includes("wellness")) {
    return "Health & wellness";
  }
  return "Small business";
}

export function generatePostsFromResearch(
  research: ReturnType<typeof buildResearchFromCrawl>,
  count = 8,
  platform = "linkedin",
) {
  const topics = research.keyTopics;
  const assignments = pillarAssignmentList(count);
  const posts: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const topic = topics[i % topics.length] ?? research.companyName;
    const pillar = assignments[i] ?? "seo";
    posts.push(buildTemplatePost(pillar, research, topic, i, platform));
  }

  return posts;
}
