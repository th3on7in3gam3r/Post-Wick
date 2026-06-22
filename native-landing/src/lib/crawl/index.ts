import { crawlWebsite } from "@/lib/crawl/website";
import { crawlWebsitePro } from "@/lib/crawl/pro-crawler";

export async function crawlBrandWebsite(seedUrl: string, maxPages = 12) {
  try {
    const pages = await crawlWebsitePro(seedUrl, maxPages);
    if (pages.length > 0) {
      return { pages, engine: "pro" as const };
    }
  } catch {
    // fall through to lightweight crawler
  }

  const pages = await crawlWebsite(seedUrl, Math.min(maxPages, 6));
  return { pages, engine: "basic" as const };
}
