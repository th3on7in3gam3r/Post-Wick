/** Scopes required to publish photos/posts to a Facebook Page. */
export const FACEBOOK_PUBLISH_SCOPES = ["pages_manage_posts"] as const;

export type MetaDebugTokenData = {
  is_valid?: boolean;
  type?: string;
  scopes?: string[];
  granular_scopes?: Array<{
    scope?: string;
    target_ids?: string[];
  }>;
  error?: { message?: string; code?: number };
};

export function collectMetaTokenScopes(data: MetaDebugTokenData): Set<string> {
  const granted = new Set<string>();
  for (const scope of data.scopes ?? []) {
    if (scope) granted.add(scope);
  }
  for (const entry of data.granular_scopes ?? []) {
    if (entry.scope) granted.add(entry.scope);
  }
  return granted;
}

/**
 * True when the token grants `scope` for `pageId`.
 * Empty/absent target_ids means the grant is not page-restricted.
 */
export function metaTokenHasPageScope(
  data: MetaDebugTokenData,
  scope: string,
  pageId: string,
): boolean {
  const granted = collectMetaTokenScopes(data);
  if (!granted.has(scope)) return false;

  const granular = data.granular_scopes?.find((entry) => entry.scope === scope);
  const targets = granular?.target_ids;
  if (!targets || targets.length === 0) return true;
  return targets.includes(pageId);
}

export function missingFacebookPublishScopes(
  data: MetaDebugTokenData,
  pageId: string,
  required: readonly string[] = FACEBOOK_PUBLISH_SCOPES,
): string[] {
  return required.filter((scope) => !metaTokenHasPageScope(data, scope, pageId));
}

export function facebookPublishPermissionError(
  missingScopes: string[],
): string {
  const list = missingScopes.join(", ");
  return (
    `Facebook connection is missing publish permission(s): ${list}. ` +
    "Reconnect Facebook under Integrations and grant Page publishing access " +
    "(pages_manage_posts). If you already granted access, your Meta app may still need " +
    "Advanced Access for pages_manage_posts in App Review."
  );
}

export function facebookPageCannotCreateContentError(): string {
  return (
    "This Facebook Page connection cannot create content on the selected Page. " +
    "Reconnect with a Page admin (or editor) account that can publish posts."
  );
}
