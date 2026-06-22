import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { CrawledPage } from "@/lib/crawl/website";

const execFileAsync = promisify(execFile);

type ScrapedPage = {
  url: string;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  paragraphs: string;
};

function toCrawledPage(page: ScrapedPage): CrawledPage {
  return {
    url: page.url,
    title: page.title,
    metaDescription: page.metaDescription,
    h1: page.h1,
    h2: page.h2,
    paragraphs: page.paragraphs,
  };
}

function crawlerBinPath() {
  return join(process.cwd(), "../web-crawler/dist/index.js");
}

export async function crawlWebsitePro(seedUrl: string, maxPages = 12): Promise<CrawledPage[]> {
  const outputDir = mkdtempSync(join(tmpdir(), "postwick-crawl-"));

  try {
    await execFileAsync(
      process.execPath,
      [
        crawlerBinPath(),
        "crawl",
        seedUrl,
        "--output",
        outputDir,
        "--max-pages",
        String(maxPages),
        "--depth",
        "2",
        "--delay",
        "200",
        "--concurrency",
        "2",
      ],
      { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 },
    );

    const resultsPath = join(outputDir, "results.jsonl");
    const raw = readFileSync(resultsPath, "utf-8").trim();
    if (!raw) return [];

    return raw
      .split("\n")
      .map((line) => JSON.parse(line) as ScrapedPage)
      .map(toCrawledPage);
  } finally {
    rmSync(outputDir, { recursive: true, force: true });
  }
}
