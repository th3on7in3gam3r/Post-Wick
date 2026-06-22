import type { AxiosInstance } from "axios";
import pLimit from "p-limit";
import {
  createHttpClient,
  fetchWithAxios,
  skipReasonForResponse,
} from "./http.js";
import { logger } from "./logger.js";
import { closePlaywright, fetchWithPlaywright } from "./playwright-fetch.js";
import { createRobotsForSeed, type RobotsTxt } from "./robots.js";
import { discoverLinks, loadSelectorConfig, scrapePage } from "./scraper.js";
import { CrawlStorage } from "./storage.js";
import type { CrawlerOptions, CrawlSummary } from "./types.js";
import {
  getOrigin,
  isBinaryUrl,
  isSameDomain,
  normalizeUrl,
  sleep,
} from "./url-utils.js";

type QueueItem = {
  url: string;
  depth: number;
};

export class Crawler {
  private readonly seedOrigin: string;
  private readonly visited = new Set<string>();
  private readonly scheduled = new Set<string>();
  private readonly queue: QueueItem[] = [];
  private readonly stack: QueueItem[] = [];
  private readonly storage: CrawlStorage;
  private readonly http: AxiosInstance;
  private readonly selectorConfig: ReturnType<typeof loadSelectorConfig>;
  private robots!: RobotsTxt;
  private shuttingDown = false;
  private abortController = new AbortController();
  private activeWorkers = 0;
  private startedAt = new Date().toISOString();

  constructor(private readonly options: CrawlerOptions) {
    const normalizedSeed = normalizeUrl(options.seedUrl);
    if (!normalizedSeed) {
      throw new Error(`Invalid seed URL: ${options.seedUrl}`);
    }

    this.options = { ...options, seedUrl: normalizedSeed };
    this.seedOrigin = getOrigin(normalizedSeed);
    this.storage = new CrawlStorage(options.outputDir, options.useSqlite);
    this.http = createHttpClient(options.userAgent);
    this.selectorConfig = loadSelectorConfig(options.selectorsPath);
  }

  async run(): Promise<CrawlSummary> {
    this.registerSignalHandlers();
    this.robots = await createRobotsForSeed(
      this.options.seedUrl,
      this.options.userAgent,
      this.abortController.signal,
    );

    this.schedule({ url: this.options.seedUrl, depth: 0 });

    const limit = pLimit(this.options.concurrency);

    while (!this.shuttingDown) {
      if (this.pendingCount() === 0 && this.activeWorkers === 0) {
        break;
      }

      if (this.pendingCount() === 0) {
        await sleep(50);
        continue;
      }

      const batch: Array<Promise<void>> = [];
      while (
        batch.length < this.options.concurrency &&
        this.pendingCount() > 0 &&
        !this.shuttingDown
      ) {
        const item = this.dequeue();
        if (!item) break;

        const normalized = normalizeUrl(item.url);
        if (!normalized || this.visited.has(normalized)) {
          if (normalized) this.scheduled.delete(normalized);
          continue;
        }

        if (this.visited.size >= this.options.maxPages) {
          break;
        }

        batch.push(
          limit(async () => {
            this.activeWorkers += 1;
            try {
              await this.processItem(item);
            } finally {
              this.activeWorkers -= 1;
            }
          }),
        );
      }

      if (batch.length === 0) {
        await sleep(50);
        continue;
      }

      await Promise.allSettled(batch);
    }

    if (this.options.usePlaywright) {
      await closePlaywright();
    }

    const summary = this.storage.writeSummary({
      seedUrl: this.options.seedUrl,
      startedAt: this.startedAt,
      strategy: this.options.strategy,
      maxDepth: this.options.maxDepth,
      maxPages: this.options.maxPages,
    });

    this.storage.close();
    return summary;
  }

  private registerSignalHandlers() {
    const shutdown = () => {
      if (this.shuttingDown) return;
      this.shuttingDown = true;
      logger.warn("Shutdown requested — finishing active requests...");
      this.abortController.abort();
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  }

  private hasWork(): boolean {
    return this.pendingCount() > 0 || this.activeWorkers > 0;
  }

  private pendingCount(): number {
    return this.options.strategy === "bfs"
      ? this.queue.length
      : this.stack.length;
  }

  private dequeue(): QueueItem | undefined {
    return this.options.strategy === "bfs"
      ? this.queue.shift()
      : this.stack.pop();
  }

  private schedule(item: QueueItem) {
    const normalized = normalizeUrl(item.url);
    if (!normalized) return;
    if (this.visited.has(normalized) || this.scheduled.has(normalized)) {
      return;
    }
    if (!this.options.allowExternal && !isSameDomain(normalized, this.seedOrigin)) {
      return;
    }
    if (item.depth > this.options.maxDepth) return;
    if (isBinaryUrl(normalized)) return;

    this.scheduled.add(normalized);
    this.enqueue(item);
  }

  private enqueue(item: QueueItem) {
    if (this.options.strategy === "bfs") {
      this.queue.push(item);
    } else {
      this.stack.push(item);
    }
  }

  private async processItem(item: QueueItem) {
    if (this.shuttingDown) return;

    const normalized = normalizeUrl(item.url);
    if (!normalized || this.visited.has(normalized)) {
      return;
    }

    if (this.visited.size >= this.options.maxPages) {
      return;
    }

    if (item.depth > this.options.maxDepth) {
      return;
    }

    if (isBinaryUrl(normalized)) {
      return;
    }

    if (!this.options.allowExternal && !isSameDomain(normalized, this.seedOrigin)) {
      return;
    }

    if (!this.robots.isAllowed(normalized)) {
      logger.info(`Blocked by robots.txt: ${normalized}`);
      this.scheduled.delete(normalized);
      return;
    }

    this.visited.add(normalized);
    this.scheduled.delete(normalized);

    const delayMs = Math.max(
      this.options.delayMs,
      this.robots.crawlDelayMs ?? 0,
    );
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    try {
      const fetchResult = this.options.usePlaywright
        ? await fetchWithPlaywright(
            normalized,
            this.options.userAgent,
            this.abortController.signal,
          )
        : await fetchWithAxios(
            this.http,
            normalized,
            this.abortController.signal,
          );

      const skipReason = skipReasonForResponse(
        fetchResult.statusCode,
        fetchResult.contentType,
      );

      if (skipReason) {
        this.storage.saveError({
          url: normalized,
          message: skipReason,
          statusCode: fetchResult.statusCode,
          timestamp: new Date().toISOString(),
        });
        logger.warn(`Skipped ${normalized}: ${skipReason}`);
        return;
      }

      const page = scrapePage(
        fetchResult,
        item.depth,
        this.seedOrigin,
        this.selectorConfig,
      );

      this.storage.savePage(page);
      logger.info(
        `Scraped [${page.statusCode}] ${page.url} (${page.responseTimeMs}ms)`,
      );

      if (item.depth < this.options.maxDepth) {
        for (const link of discoverLinks(page)) {
          this.schedule({ url: link, depth: item.depth + 1 });
        }
      }
    } catch (error) {
      if (this.abortController.signal.aborted) {
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.storage.saveError({
        url: normalized,
        message,
        timestamp: new Date().toISOString(),
      });
      logger.error(`Failed ${normalized}: ${message}`);
    }
  }
}
