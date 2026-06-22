#!/usr/bin/env node
import { resolve } from "node:path";
import { Command } from "commander";
import { Crawler } from "./crawler.js";
import { logger } from "./logger.js";
import type { CrawlStrategy } from "./types.js";
import { normalizeUrl } from "./url-utils.js";

const DEFAULT_USER_AGENT = "PostWickCrawler/1.0 (+https://postwick.com)";

export async function runCli(argv: string[] = process.argv) {
  const program = new Command();

  program
    .name("postwick-crawl")
    .description("Page-by-page web crawler and scraper")
    .showHelpAfterError();

  program
    .command("crawl")
    .description("Crawl and scrape a website starting from a seed URL")
    .argument("<url>", "Seed URL to start crawling")
    .option("-o, --output <dir>", "Output directory", "./output")
    .option("-s, --strategy <mode>", "Crawl strategy: bfs or dfs", "bfs")
    .option("--allow-external", "Follow external links", false)
    .option("-d, --depth <n>", "Maximum crawl depth", "3")
    .option("-m, --max-pages <n>", "Maximum pages to crawl", "100")
    .option("--delay <ms>", "Delay between requests in ms", "500")
    .option("-c, --concurrency <n>", "Max concurrent requests", "2")
    .option("--selectors <file>", "Custom CSS selector config JSON")
    .option("--sqlite", "Also store results in SQLite", false)
    .option("--playwright", "Use Playwright for JS-rendered pages", false)
    .option("--user-agent <ua>", "Custom User-Agent header", DEFAULT_USER_AGENT)
    .action(async (url: string, options) => {
      const seedUrl = normalizeUrl(url);
      if (!seedUrl) {
        logger.error(`Invalid URL: ${url}`);
        process.exitCode = 1;
        return;
      }

      const strategy = options.strategy as CrawlStrategy;
      if (strategy !== "bfs" && strategy !== "dfs") {
        logger.error("Strategy must be bfs or dfs");
        process.exitCode = 1;
        return;
      }

      const crawler = new Crawler({
        seedUrl,
        outputDir: resolve(options.output),
        strategy,
        allowExternal: Boolean(options.allowExternal),
        maxDepth: Number.parseInt(options.depth, 10),
        maxPages: Number.parseInt(options.maxPages, 10),
        delayMs: Number.parseInt(options.delay, 10),
        concurrency: Number.parseInt(options.concurrency, 10),
        usePlaywright: Boolean(options.playwright),
        useSqlite: Boolean(options.sqlite),
        selectorsPath: options.selectors,
        userAgent: options.userAgent,
      });

      logger.info(`Starting crawl: ${seedUrl}`);
      const summary = await crawler.run();

      logger.info(
        `Done. Pages: ${summary.totalPages}, Errors: ${summary.totalErrors}, Avg: ${summary.avgResponseTimeMs}ms`,
      );

      if (summary.topLinkedPages.length > 0) {
        logger.info("Top linked pages:");
        for (const entry of summary.topLinkedPages.slice(0, 5)) {
          logger.info(`  ${entry.inboundLinks}x ${entry.url}`);
        }
      }
    });

  await program.parseAsync(argv);
}
