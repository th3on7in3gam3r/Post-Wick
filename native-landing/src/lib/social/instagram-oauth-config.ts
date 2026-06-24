function appBaseUrl(origin?: string) {
  return (origin ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export type InstagramOAuthValidation = {
  ok: boolean;
  redirectUri: string;
  issues: string[];
  usesInstagramAppId: boolean;
};

export function instagramRedirectUri(origin?: string) {
  const override = process.env.META_OAUTH_REDIRECT_URI?.trim();
  if (override) return override;
  return `${appBaseUrl(origin)}/api/social/meta/callback`;
}

export function validateInstagramOAuth(origin?: string): InstagramOAuthValidation {
  const usesInstagramAppId = Boolean(process.env.INSTAGRAM_APP_ID?.trim());
  const usesInstagramAppSecret = Boolean(process.env.INSTAGRAM_APP_SECRET?.trim());
  const redirectUri = instagramRedirectUri(origin);
  const issues: string[] = [];

  if (!usesInstagramAppId) {
    issues.push(
      "INSTAGRAM_APP_ID is missing. In Meta, open Instagram → API setup with Instagram login → Business login settings and copy the Instagram App ID (not App Settings → Basic).",
    );
  }

  if (!usesInstagramAppSecret && !process.env.META_APP_SECRET?.trim()) {
    issues.push("INSTAGRAM_APP_SECRET (or META_APP_SECRET) is missing.");
  }

  return {
    ok: issues.length === 0,
    redirectUri,
    issues,
    usesInstagramAppId,
  };
}

export function parseInstagramShortLivedToken(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid Instagram token response");
  }

  const record = payload as {
    access_token?: string;
    data?: Array<{ access_token?: string }>;
  };

  const token = record.access_token ?? record.data?.[0]?.access_token;
  if (!token) {
    throw new Error("Instagram token response missing access_token");
  }

  return token;
}
