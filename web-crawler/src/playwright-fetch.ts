import type { FetchResult } from "./types.js";

let browser: import("playwright").Browser | null = null;

async function getBrowser(): Promise<import("playwright").Browser> {
  if (!browser) {
    const { chromium } = await import("playwright");
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function fetchWithPlaywright(
  url: string,
  userAgent: string,
  signal?: AbortSignal,
): Promise<FetchResult> {
  const started = Date.now();
  const instance = await getBrowser();
  const context = await instance.newContext({ userAgent });
  const page = await context.newPage();

  if (signal) {
    signal.addEventListener(
      "abort",
      () => {
        void page.close().catch(() => undefined);
      },
      { once: true },
    );
  }

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    const statusCode = response?.status() ?? 0;
    const headers = response?.headers() ?? {};
    const contentType = headers["content-type"] ?? "text/html";
    const html = await page.content();
    const finalUrl = page.url();

    return {
      url: finalUrl,
      statusCode,
      contentType,
      html,
      responseTimeMs: Date.now() - started,
    };
  } finally {
    await context.close();
  }
}

export async function closePlaywright(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
