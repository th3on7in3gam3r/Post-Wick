import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import type { CrawlError, CrawlSummary, ScrapedPage } from "./types.js";
import { logger } from "./logger.js";

export class CrawlStorage {
  private readonly resultsPath: string;
  private readonly errorsPath: string;
  private readonly summaryPath: string;
  private db: Database.Database | null = null;
  private insertPageStmt: Database.Statement | null = null;
  private insertErrorStmt: Database.Statement | null = null;

  private pages: ScrapedPage[] = [];
  private errors: CrawlError[] = [];
  private inboundCounts = new Map<string, number>();

  constructor(
    outputDir: string,
    private readonly useSqlite: boolean,
  ) {
    mkdirSync(outputDir, { recursive: true });
    this.resultsPath = join(outputDir, "results.jsonl");
    this.errorsPath = join(outputDir, "errors.jsonl");
    this.summaryPath = join(outputDir, "summary.json");

    writeFileSync(this.resultsPath, "");
    writeFileSync(this.errorsPath, "");

    if (useSqlite) {
      this.initSqlite(join(outputDir, "crawl.db"));
    }
  }

  private initSqlite(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        url TEXT PRIMARY KEY,
        status_code INTEGER,
        title TEXT,
        meta_description TEXT,
        h1 TEXT,
        h2 TEXT,
        h3 TEXT,
        paragraphs TEXT,
        internal_links TEXT,
        external_links TEXT,
        images TEXT,
        scraped_at TEXT,
        response_time_ms INTEGER,
        depth INTEGER,
        custom TEXT
      );

      CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT,
        message TEXT,
        status_code INTEGER,
        timestamp TEXT
      );
    `);

    this.insertPageStmt = this.db.prepare(`
      INSERT OR REPLACE INTO pages (
        url, status_code, title, meta_description, h1, h2, h3, paragraphs,
        internal_links, external_links, images, scraped_at, response_time_ms,
        depth, custom
      ) VALUES (
        @url, @status_code, @title, @meta_description, @h1, @h2, @h3, @paragraphs,
        @internal_links, @external_links, @images, @scraped_at, @response_time_ms,
        @depth, @custom
      )
    `);

    this.insertErrorStmt = this.db.prepare(`
      INSERT INTO errors (url, message, status_code, timestamp)
      VALUES (@url, @message, @status_code, @timestamp)
    `);
  }

  savePage(page: ScrapedPage) {
    this.pages.push(page);
    appendFileSync(this.resultsPath, `${JSON.stringify(page)}\n`);

    for (const link of page.internalLinks) {
      this.inboundCounts.set(link, (this.inboundCounts.get(link) ?? 0) + 1);
    }

    if (this.insertPageStmt) {
      this.insertPageStmt.run({
        url: page.url,
        status_code: page.statusCode,
        title: page.title,
        meta_description: page.metaDescription,
        h1: JSON.stringify(page.h1),
        h2: JSON.stringify(page.h2),
        h3: JSON.stringify(page.h3),
        paragraphs: page.paragraphs,
        internal_links: JSON.stringify(page.internalLinks),
        external_links: JSON.stringify(page.externalLinks),
        images: JSON.stringify(page.images),
        scraped_at: page.scrapedAt,
        response_time_ms: page.responseTimeMs,
        depth: page.depth,
        custom: page.custom ? JSON.stringify(page.custom) : null,
      });
    }
  }

  saveError(error: CrawlError) {
    this.errors.push(error);
    appendFileSync(this.errorsPath, `${JSON.stringify(error)}\n`);

    this.insertErrorStmt?.run({
      url: error.url,
      message: error.message,
      status_code: error.statusCode ?? null,
      timestamp: error.timestamp,
    });
  }

  writeSummary(
    summary: Omit<
      CrawlSummary,
      "topLinkedPages" | "totalPages" | "totalErrors" | "avgResponseTimeMs" | "finishedAt"
    >,
  ) {
    const avgResponseTimeMs =
      this.pages.length === 0
        ? 0
        : Math.round(
            this.pages.reduce((sum, page) => sum + page.responseTimeMs, 0) /
              this.pages.length,
          );

    const topLinkedPages = [...this.inboundCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, inboundLinks]) => ({ url, inboundLinks }));

    const fullSummary: CrawlSummary = {
      ...summary,
      totalPages: this.pages.length,
      totalErrors: this.errors.length,
      avgResponseTimeMs,
      topLinkedPages,
      finishedAt: new Date().toISOString(),
    };

    writeFileSync(this.summaryPath, JSON.stringify(fullSummary, null, 2));
    logger.info(`Summary written to ${this.summaryPath}`);
    return fullSummary;
  }

  close() {
    this.db?.close();
    this.db = null;
  }
}
