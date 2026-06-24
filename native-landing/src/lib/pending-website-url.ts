export const PENDING_WEBSITE_URL_KEY = "postwick_website_url";

export function savePendingWebsiteUrl(url: string) {
  sessionStorage.setItem(PENDING_WEBSITE_URL_KEY, url);
}

export function clearPendingWebsiteUrl() {
  sessionStorage.removeItem(PENDING_WEBSITE_URL_KEY);
}

export function consumePendingWebsiteUrl(): string | null {
  const stored = sessionStorage.getItem(PENDING_WEBSITE_URL_KEY);
  if (!stored) return null;
  sessionStorage.removeItem(PENDING_WEBSITE_URL_KEY);
  return stored;
}
