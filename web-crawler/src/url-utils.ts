const BINARY_EXTENSIONS = new Set([
  ".pdf",
  ".zip",
  ".gz",
  ".rar",
  ".7z",
  ".tar",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".exe",
  ".dmg",
  ".pkg",
  ".deb",
  ".rpm",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
]);

const BINARY_CONTENT_TYPES = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
  "application/zip",
  "application/octet-stream",
  "application/x-gzip",
  "font/",
];

export function isBinaryUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const dot = pathname.lastIndexOf(".");
    if (dot === -1) return false;
    return BINARY_EXTENSIONS.has(pathname.slice(dot));
  } catch {
    return false;
  }
}

export function isBinaryContentType(contentType: string): boolean {
  const normalized = contentType.toLowerCase().split(";")[0].trim();
  return BINARY_CONTENT_TYPES.some((prefix) => normalized.startsWith(prefix));
}

export function normalizeUrl(raw: string, base?: string): string | null {
  try {
    const url = base ? new URL(raw, base) : new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    url.hash = "";

    if (
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    ) {
      url.port = "";
    }

    url.hostname = url.hostname.toLowerCase();

    const params = [...url.searchParams.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    );
    url.search = "";
    for (const [key, value] of params) {
      url.searchParams.append(key, value);
    }

    let normalized = url.toString();
    if (normalized.endsWith("/") && url.pathname !== "/") {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    return null;
  }
}

export function getOrigin(url: string): string {
  const parsed = new URL(url);
  return `${parsed.protocol}//${parsed.host}`;
}

export function isSameDomain(url: string, seedOrigin: string): boolean {
  try {
    return getOrigin(url) === seedOrigin;
  } catch {
    return false;
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
