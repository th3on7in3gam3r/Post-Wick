import axios, { type AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { logger } from "./logger.js";
import type { FetchResult } from "./types.js";
import { isBinaryContentType } from "./url-utils.js";

export function createHttpClient(userAgent: string): AxiosInstance {
  const client = axios.create({
    timeout: 30_000,
    maxRedirects: 5,
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    validateStatus: () => true,
    responseType: "text",
    transformResponse: [(data) => data],
  });

  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 429 ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
    onRetry: (retryCount, error, requestConfig) => {
      logger.warn(
        `Retry ${retryCount} for ${requestConfig.url}: ${error.message}`,
      );
    },
  });

  return client;
}

export async function fetchWithAxios(
  client: AxiosInstance,
  url: string,
  signal?: AbortSignal,
): Promise<FetchResult> {
  const started = Date.now();
  const response = await client.get<string>(url, { signal });
  const contentType = String(response.headers["content-type"] ?? "");
  const responseTimeMs = Date.now() - started;

  return {
    url: response.request?.res?.responseUrl ?? url,
    statusCode: response.status,
    contentType,
    html: typeof response.data === "string" ? response.data : "",
    responseTimeMs,
  };
}

export function isHtmlResponse(contentType: string): boolean {
  const normalized = contentType.toLowerCase();
  return (
    normalized.includes("text/html") ||
    normalized.includes("application/xhtml+xml") ||
    normalized === ""
  );
}

export function skipReasonForResponse(
  statusCode: number,
  contentType: string,
): string | null {
  if (statusCode < 200 || statusCode >= 300) {
    return `HTTP ${statusCode}`;
  }
  if (isBinaryContentType(contentType)) {
    return `Binary content-type: ${contentType}`;
  }
  if (!isHtmlResponse(contentType)) {
    return `Non-HTML content-type: ${contentType}`;
  }
  return null;
}
