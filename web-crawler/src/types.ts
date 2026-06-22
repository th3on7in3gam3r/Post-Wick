export type CrawlStrategy = "bfs" | "dfs";

export type CrawlerOptions = {
  seedUrl: string;
  outputDir: string;
  strategy: CrawlStrategy;
  allowExternal: boolean;
  maxDepth: number;
  maxPages: number;
  delayMs: number;
  concurrency: number;
  usePlaywright: boolean;
  useSqlite: boolean;
  selectorsPath?: string;
  userAgent: string;
};

export type PageImage = {
  src: string;
  alt: string;
};

export type ScrapedPage = {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1: string[];
  h2: string[];
  h3: string[];
  paragraphs: string;
  internalLinks: string[];
  externalLinks: string[];
  images: PageImage[];
  scrapedAt: string;
  responseTimeMs: number;
  depth: number;
  custom?: Record<string, string | string[]>;
};

export type CrawlError = {
  url: string;
  message: string;
  statusCode?: number;
  timestamp: string;
};

export type CrawlSummary = {
  seedUrl: string;
  startedAt: string;
  finishedAt: string;
  totalPages: number;
  totalErrors: number;
  avgResponseTimeMs: number;
  topLinkedPages: Array<{ url: string; inboundLinks: number }>;
  strategy: CrawlStrategy;
  maxDepth: number;
  maxPages: number;
};

export type SelectorConfig = {
  default?: Record<string, string>;
  patterns?: Array<{
    match: string;
    fields: Record<string, string>;
  }>;
};

export type FetchResult = {
  url: string;
  statusCode: number;
  contentType: string;
  html: string;
  responseTimeMs: number;
};
