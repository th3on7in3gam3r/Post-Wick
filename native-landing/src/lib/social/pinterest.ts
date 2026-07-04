import { normalizeBaseUrl } from "@/lib/brand";

const PINTEREST_SCOPES = [
  "user_accounts:read",
  "boards:read",
  "pins:write",
] as const;

const API_BASE = "https://api.pinterest.com/v5";

export type PinterestConnectionMetadata = {
  boardId: string;
  boardName: string;
  username?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  accessTokenExpiresAt?: string;
};

export type PinterestBoardOption = {
  id: string;
  name: string;
  pictureUrl: string | null;
};

type PinterestTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  token_type?: string;
  scope?: string;
};

function appBaseUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
}

export function pinterestAppId() {
  return process.env.PINTEREST_APP_ID?.trim() ?? "";
}

export function pinterestAppSecret() {
  return process.env.PINTEREST_APP_SECRET?.trim() ?? "";
}

export function isPinterestConfigured() {
  return Boolean(pinterestAppId() && pinterestAppSecret());
}

export function pinterestRedirectUri() {
  const override = process.env.PINTEREST_OAUTH_REDIRECT_URI?.trim();
  if (override) return override.replace(/\/+$/, "");
  return `${appBaseUrl()}/api/social/pinterest/callback`;
}

function basicAuthHeader() {
  const appId = pinterestAppId();
  const appSecret = pinterestAppSecret();
  if (!appId || !appSecret) {
    throw new Error("Pinterest OAuth is not configured");
  }
  return `Basic ${Buffer.from(`${appId}:${appSecret}`).toString("base64")}`;
}

async function readPinterestError(response: Response) {
  try {
    const detail = await response.text();
    return detail.slice(0, 320) || response.statusText;
  } catch {
    return response.statusText;
  }
}

export function getPinterestAuthUrl(brandId: string) {
  const appId = pinterestAppId();
  if (!appId) {
    throw new Error("Pinterest OAuth is not configured");
  }

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: pinterestRedirectUri(),
    response_type: "code",
    scope: PINTEREST_SCOPES.join(","),
    state: brandId,
  });

  return `https://www.pinterest.com/oauth/?${params}`;
}

export async function exchangePinterestCode(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: pinterestRedirectUri(),
  });

  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    console.error("[pinterest-token]", response.status, await readPinterestError(response));
    throw new Error(`Failed to exchange Pinterest authorization code (${response.status})`);
  }

  return (await response.json()) as PinterestTokenResponse;
}

export async function refreshPinterestAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    console.error("[pinterest-refresh]", response.status, await readPinterestError(response));
    throw new Error(`Failed to refresh Pinterest access token (${response.status})`);
  }

  return (await response.json()) as PinterestTokenResponse;
}

export function buildPinterestMetadata(
  token: PinterestTokenResponse,
  board: PinterestBoardOption,
  username?: string,
): PinterestConnectionMetadata {
  const metadata: PinterestConnectionMetadata = {
    boardId: board.id,
    boardName: board.name,
  };

  if (username) {
    metadata.username = username;
  }

  if (token.refresh_token) {
    metadata.refreshToken = token.refresh_token;
  }

  if (token.expires_in) {
    metadata.accessTokenExpiresAt = new Date(
      Date.now() + token.expires_in * 1000,
    ).toISOString();
  }

  if (token.refresh_token_expires_in) {
    metadata.refreshTokenExpiresAt = new Date(
      Date.now() + token.refresh_token_expires_in * 1000,
    ).toISOString();
  }

  return metadata;
}

export function parsePinterestMetadata(
  raw: string | null | undefined,
): PinterestConnectionMetadata | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PinterestConnectionMetadata;
  } catch {
    return null;
  }
}

function tokenNeedsRefresh(metadata: PinterestConnectionMetadata | null) {
  if (!metadata?.accessTokenExpiresAt) return false;
  return new Date(metadata.accessTokenExpiresAt).getTime() <= Date.now() + 60_000;
}

export async function resolvePinterestAccessToken(
  accessToken: string,
  metadata: PinterestConnectionMetadata | null,
): Promise<{ accessToken: string; metadata: PinterestConnectionMetadata | null }> {
  if (!metadata?.refreshToken || !tokenNeedsRefresh(metadata)) {
    return { accessToken, metadata };
  }

  const refreshed = await refreshPinterestAccessToken(metadata.refreshToken);
  const nextMetadata = buildPinterestMetadata(refreshed, {
    id: metadata.boardId,
    name: metadata.boardName,
    pictureUrl: null,
  }, metadata.username);

  return {
    accessToken: refreshed.access_token,
    metadata: {
      ...metadata,
      ...nextMetadata,
      boardId: metadata.boardId,
      boardName: metadata.boardName,
      username: metadata.username,
    },
  };
}

export async function fetchPinterestUserAccount(accessToken: string) {
  const response = await fetch(`${API_BASE}/user_account`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load Pinterest account (${response.status}): ${await readPinterestError(response)}`,
    );
  }

  return (await response.json()) as { username?: string; profile_image?: string };
}

export async function fetchPinterestBoards(accessToken: string): Promise<PinterestBoardOption[]> {
  const response = await fetch(`${API_BASE}/boards?page_size=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load Pinterest boards (${response.status}): ${await readPinterestError(response)}`,
    );
  }

  const payload = (await response.json()) as {
    items?: Array<{
      id?: string;
      name?: string;
      media?: { image_cover_url?: string };
    }>;
  };

  return (payload.items ?? [])
    .filter((board): board is { id: string; name: string; media?: { image_cover_url?: string } } =>
      Boolean(board.id && board.name),
    )
    .map((board) => ({
      id: board.id,
      name: board.name,
      pictureUrl: board.media?.image_cover_url ?? null,
    }));
}

export function buildPinterestConnectionFromBoard(input: {
  board: PinterestBoardOption;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshTokenExpiresIn?: number;
  username?: string;
}) {
  const token: PinterestTokenResponse = {
    access_token: input.accessToken,
    refresh_token: input.refreshToken,
    expires_in: input.expiresIn,
    refresh_token_expires_in: input.refreshTokenExpiresIn,
  };

  return {
    accountName: input.username
      ? `@${input.username} · ${input.board.name}`
      : `${input.board.name} on Pinterest`,
    accessToken: input.accessToken,
    metadata: buildPinterestMetadata(token, input.board, input.username),
  };
}

export async function publishToPinterest(
  accessToken: string,
  metadata: PinterestConnectionMetadata,
  content: string,
  imageUrl: string,
  linkUrl?: string | null,
) {
  if (!metadata.boardId) {
    throw new Error("Pinterest board metadata is missing for this connection");
  }

  const resolved = await resolvePinterestAccessToken(accessToken, metadata);
  const token = resolved.accessToken;

  const lines = content.trim().split(/\n+/).filter(Boolean);
  const title = (lines[0] ?? content).slice(0, 100);
  const description = content.slice(0, 500);

  const body: Record<string, unknown> = {
    board_id: metadata.boardId,
    title,
    description,
    media_source: {
      source_type: "image_url",
      url: imageUrl,
    },
  };

  if (linkUrl) {
    body.link = linkUrl;
  }

  const response = await fetch(`${API_BASE}/pins`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Pinterest publish failed: ${await readPinterestError(response)}`);
  }

  const payload = (await response.json()) as { id?: string };
  if (payload.id) {
    return `https://www.pinterest.com/pin/${payload.id}/`;
  }

  return "pinterest-pin";
}
