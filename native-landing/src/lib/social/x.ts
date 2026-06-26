import { createHash, randomBytes } from "node:crypto";

const X_OAUTH_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
  "media.write",
].join(" ");

export type XConnectionMetadata = {
  refreshToken?: string;
  expiresAt?: string;
  username?: string;
  userId?: string;
};

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

function base64UrlEncode(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function xClientId() {
  return (
    process.env.X_CLIENT_ID?.trim() ||
    process.env.TWITTER_CLIENT_ID?.trim() ||
    ""
  );
}

export function xClientSecret() {
  return (
    process.env.X_CLIENT_SECRET?.trim() ||
    process.env.TWITTER_CLIENT_SECRET?.trim() ||
    ""
  );
}

export function isXConfigured() {
  return Boolean(xClientId() && xClientSecret());
}

export function xRedirectUri() {
  return `${appBaseUrl()}/api/social/x/callback`;
}

export function generateXCodeVerifier() {
  return base64UrlEncode(randomBytes(32));
}

export function generateXCodeChallenge(verifier: string) {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

export function getXAuthUrl(brandId: string, codeChallenge: string) {
  const clientId = xClientId();
  if (!clientId) {
    throw new Error("X OAuth is not configured");
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: xRedirectUri(),
    scope: X_OAUTH_SCOPES,
    state: brandId,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `https://twitter.com/i/oauth2/authorize?${params}`;
}

function xBasicAuthHeader() {
  const clientId = xClientId();
  const clientSecret = xClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("X OAuth is not configured");
  }

  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`;
}

async function readXError(response: Response) {
  try {
    const detail = await response.text();
    return detail.slice(0, 320) || response.statusText;
  } catch {
    return response.statusText;
  }
}

type XTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};

export async function exchangeXCode(code: string, codeVerifier: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: xRedirectUri(),
    code_verifier: codeVerifier,
    client_id: xClientId(),
  });

  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: xBasicAuthHeader(),
    },
    body,
  });

  if (!response.ok) {
    console.error("[x-token]", response.status, await readXError(response));
    throw new Error(`Failed to exchange X authorization code (${response.status})`);
  }

  return (await response.json()) as XTokenResponse;
}

export async function refreshXAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: xClientId(),
  });

  const response = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: xBasicAuthHeader(),
    },
    body,
  });

  if (!response.ok) {
    console.error("[x-refresh]", response.status, await readXError(response));
    throw new Error(`Failed to refresh X access token (${response.status})`);
  }

  return (await response.json()) as XTokenResponse;
}

export function buildXMetadata(
  token: XTokenResponse,
  profile?: { id: string; username: string },
): XConnectionMetadata {
  const metadata: XConnectionMetadata = {};

  if (token.refresh_token) {
    metadata.refreshToken = token.refresh_token;
  }

  if (token.expires_in) {
    metadata.expiresAt = new Date(Date.now() + token.expires_in * 1000).toISOString();
  }

  if (profile) {
    metadata.userId = profile.id;
    metadata.username = profile.username;
  }

  return metadata;
}

export function parseXMetadata(raw: string | null | undefined): XConnectionMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as XConnectionMetadata;
  } catch {
    return null;
  }
}

function tokenNeedsRefresh(metadata: XConnectionMetadata | null) {
  if (!metadata?.expiresAt) return false;
  return new Date(metadata.expiresAt).getTime() <= Date.now() + 60_000;
}

export async function resolveXAccessToken(
  accessToken: string,
  metadata: XConnectionMetadata | null,
): Promise<{ accessToken: string; metadata: XConnectionMetadata | null }> {
  if (!metadata?.refreshToken || !tokenNeedsRefresh(metadata)) {
    return { accessToken, metadata };
  }

  const refreshed = await refreshXAccessToken(metadata.refreshToken);
  const nextMetadata = buildXMetadata(refreshed, {
    id: metadata.userId ?? "",
    username: metadata.username ?? "",
  });

  return {
    accessToken: refreshed.access_token,
    metadata: {
      ...metadata,
      ...nextMetadata,
      userId: metadata.userId ?? nextMetadata.userId,
      username: metadata.username ?? nextMetadata.username,
    },
  };
}

export async function getXUserProfile(accessToken: string) {
  const response = await fetch(
    "https://api.twitter.com/2/users/me?user.fields=username,name",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load X profile: ${await readXError(response)}`);
  }

  const payload = (await response.json()) as {
    data?: { id: string; username: string; name?: string };
  };

  if (!payload.data?.id || !payload.data.username) {
    throw new Error("X profile response was incomplete");
  }

  return payload.data;
}

async function fetchImageBinary(imageUrl: string) {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch post image (${response.status})`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new Error("Post image file is empty");
  }

  return { buffer, contentType };
}

async function uploadXMedia(accessToken: string, imageUrl: string) {
  const { buffer, contentType } = await fetchImageBinary(imageUrl);
  if (!contentType.startsWith("image/")) {
    throw new Error("X posts only support image attachments");
  }

  const form = new FormData();
  form.append("media_category", "tweet_image");
  form.append("media", new Blob([buffer], { type: contentType }), "post-image");

  const response = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`X media upload failed: ${await readXError(response)}`);
  }

  const payload = (await response.json()) as { media_id_string?: string };
  if (!payload.media_id_string) {
    throw new Error("X media upload response was incomplete");
  }

  return payload.media_id_string;
}

export async function publishToX(
  accessToken: string,
  content: string,
  imageUrl?: string | null,
  metadata?: XConnectionMetadata | null,
) {
  const resolved = await resolveXAccessToken(accessToken, metadata ?? null);
  const token = resolved.accessToken;

  const body: {
    text: string;
    media?: { media_ids: string[] };
  } = { text: content };

  if (imageUrl) {
    const mediaId = await uploadXMedia(token, imageUrl);
    body.media = { media_ids: [mediaId] };
  }

  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`X publish request failed: ${await readXError(response)}`);
  }

  const payload = (await response.json()) as { data?: { id: string } };
  const tweetId = payload.data?.id;
  if (!tweetId) {
    throw new Error("X publish response was incomplete");
  }

  return {
    externalId: tweetId,
    accessToken: resolved.accessToken,
    metadata: resolved.metadata,
  };
}
