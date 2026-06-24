import {
  instagramRedirectUri,
  parseInstagramShortLivedToken,
  validateInstagramOAuth,
} from "@/lib/social/instagram-oauth-config";

export type MetaPlatform = "instagram" | "facebook";

export type MetaConnectionDetails = {
  accountName: string;
  accessToken: string;
  metadata: {
    pageId: string;
    pageName: string;
    instagramAccountId?: string;
    instagramUsername?: string;
    authFlow?: "instagram_login" | "facebook_login";
  };
};

const GRAPH_VERSION = "v21.0";
const INSTAGRAM_AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";

const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
] as const;

export function metaRedirectUri(origin?: string) {
  return instagramRedirectUri(origin);
}

export function instagramOAuthValidation(origin?: string) {
  return validateInstagramOAuth(origin);
}

export function instagramAppCredentials() {
  const instagramAppId = process.env.INSTAGRAM_APP_ID?.trim();
  const instagramAppSecret = process.env.INSTAGRAM_APP_SECRET?.trim();

  if (instagramAppId && instagramAppSecret) {
    return { appId: instagramAppId, appSecret: instagramAppSecret };
  }

  return {
    appId: instagramAppId || process.env.META_APP_ID?.trim() || "",
    appSecret:
      instagramAppSecret ||
      process.env.META_APP_SECRET?.trim() ||
      "",
  };
}

export function isMetaConfigured() {
  const { appId, appSecret } = instagramAppCredentials();
  return Boolean(appId && appSecret);
}

export function instagramOAuthScopes() {
  return [...INSTAGRAM_SCOPES];
}

export function getMetaAuthUrl(
  brandId: string,
  platform: MetaPlatform,
  origin?: string,
) {
  const redirectUri = metaRedirectUri(origin);

  if (platform === "instagram") {
    const { appId } = instagramAppCredentials();
    if (!appId) {
      throw new Error("Instagram OAuth is not configured");
    }

    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state: `${brandId}:instagram`,
      scope: INSTAGRAM_SCOPES.join(","),
      response_type: "code",
      enable_fb_login: "false",
    });

    return `${INSTAGRAM_AUTHORIZE_URL}?${params}`;
  }

  const appId = process.env.META_APP_ID;
  if (!appId) {
    throw new Error("Meta OAuth is not configured");
  }

  const scopes = ["pages_show_list", "pages_manage_posts", "pages_read_engagement"];
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state: `${brandId}:${platform}`,
    scope: scopes.join(","),
    response_type: "code",
  });

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}`;
}

async function readGraphError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string; type?: string; code?: number };
    };
    return payload.error?.message ?? JSON.stringify(payload).slice(0, 240);
  } catch {
    return response.statusText;
  }
}

async function graphGet<T>(path: string, accessToken: string) {
  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${path}`);
  url.searchParams.set("access_token", accessToken);
  const response = await fetch(url);
  if (!response.ok) {
    const detail = await readGraphError(response);
    console.error("[meta-graph-get]", response.status, detail);
    throw new Error(`Meta Graph API request failed (${response.status}): ${detail}`);
  }
  return (await response.json()) as T;
}

export async function exchangeInstagramCode(code: string, origin?: string) {
  const { appId, appSecret } = instagramAppCredentials();
  if (!appId || !appSecret) {
    throw new Error("Instagram OAuth is not configured");
  }

  const redirectUri = metaRedirectUri(origin);

  const response = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });

  if (!response.ok) {
    const detail = await readGraphError(response);
    console.error("[instagram-token]", response.status, detail);
    throw new Error(`Failed to exchange Instagram authorization code (${response.status})`);
  }

  const shortLived = (await response.json()) as unknown;
  const shortLivedToken = parseInstagramShortLivedToken(shortLived);

  const longParams = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: appSecret,
    access_token: shortLivedToken,
  });
  const longResponse = await fetch(
    `https://graph.instagram.com/access_token?${longParams}`,
  );
  if (!longResponse.ok) {
    const detail = await readGraphError(longResponse);
    console.error("[instagram-long-token]", longResponse.status, detail);
    throw new Error(
      `Failed to exchange Instagram token for long-lived access (${longResponse.status})`,
    );
  }

  const longLived = (await longResponse.json()) as { access_token: string };
  return longLived.access_token;
}

export async function exchangeMetaCode(code: string, origin?: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Meta OAuth is not configured");
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: metaRedirectUri(origin),
    code,
  });

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${params}`,
  );
  if (!response.ok) {
    const detail = await readGraphError(response);
    console.error("[meta-token]", response.status, detail);
    throw new Error(`Failed to exchange Meta authorization code (${response.status})`);
  }

  const shortLived = (await response.json()) as { access_token: string };

  const longParams = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLived.access_token,
  });
  const longResponse = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?${longParams}`,
  );
  if (!longResponse.ok) {
    const detail = await readGraphError(longResponse);
    console.error("[meta-long-token]", longResponse.status, detail);
    throw new Error(`Failed to exchange Meta token for long-lived access (${longResponse.status})`);
  }

  const longLived = (await longResponse.json()) as { access_token: string };
  return longLived.access_token;
}

type InstagramProfile = {
  id: string;
  username?: string;
  name?: string;
};

export async function resolveInstagramConnection(
  accessToken: string,
): Promise<MetaConnectionDetails> {
  const url = new URL("https://graph.instagram.com/me");
  url.searchParams.set("fields", "id,username,name");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  if (!response.ok) {
    const detail = await readGraphError(response);
    throw new Error(`Failed to load Instagram profile (${response.status}): ${detail}`);
  }

  const profile = (await response.json()) as InstagramProfile;
  const username = profile.username ?? profile.name ?? profile.id;

  return {
    accountName: `@${username}`,
    accessToken,
    metadata: {
      pageId: profile.id,
      pageName: profile.name ?? username,
      instagramAccountId: profile.id,
      instagramUsername: username,
      authFlow: "instagram_login",
    },
  };
}

type MetaPage = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
  };
};

export async function resolveMetaConnection(
  userAccessToken: string,
  platform: MetaPlatform,
): Promise<MetaConnectionDetails> {
  const pages = await graphGet<{ data: MetaPage[] }>(
    "me/accounts?fields=id,name,access_token,instagram_business_account{id,username}",
    userAccessToken,
  );

  const page =
    pages.data.find((item) =>
      platform === "instagram"
        ? Boolean(item.instagram_business_account?.id)
        : true,
    ) ?? pages.data[0];

  if (!page) {
    throw new Error("No Facebook Page found for this Meta account");
  }

  if (platform === "instagram") {
    const instagramAccountId = page.instagram_business_account?.id;
    if (!instagramAccountId) {
      throw new Error(
        "No Instagram Business account is linked to your Facebook Page. Link IG to your Page in Meta Business Suite, then try again.",
      );
    }

    const username = page.instagram_business_account?.username ?? page.name;
    return {
      accountName: `@${username}`,
      accessToken: page.access_token,
      metadata: {
        pageId: page.id,
        pageName: page.name,
        instagramAccountId,
        instagramUsername: username,
        authFlow: "facebook_login",
      },
    };
  }

  return {
    accountName: page.name,
    accessToken: page.access_token,
    metadata: {
      pageId: page.id,
      pageName: page.name,
      authFlow: "facebook_login",
    },
  };
}

export async function publishToFacebookPage(
  pageAccessToken: string,
  pageId: string,
  content: string,
) {
  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/feed`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        access_token: pageAccessToken,
      }),
    },
  );

  if (!response.ok) {
    const detail = await readGraphError(response);
    throw new Error(`Facebook publish failed: ${detail}`);
  }

  const payload = (await response.json()) as { id?: string };
  return payload.id ?? "facebook-post";
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForInstagramContainer(
  graphBase: string,
  pageAccessToken: string,
  containerId: string,
) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(
      `${graphBase}/${containerId}?fields=status_code&access_token=${pageAccessToken}`,
    );

    if (!response.ok) {
      const detail = await readGraphError(response);
      throw new Error(`Instagram media status check failed: ${detail}`);
    }

    const payload = (await response.json()) as { status_code?: string };
    if (payload.status_code === "FINISHED") return;
    if (payload.status_code === "ERROR") {
      throw new Error("Instagram rejected the image. Use a public HTTPS image URL.");
    }

    await sleep(2000);
  }

  throw new Error("Instagram media processing timed out. Try again in a moment.");
}

export async function publishToInstagram(
  pageAccessToken: string,
  instagramAccountId: string,
  content: string,
  imageUrl: string,
  options?: { authFlow?: MetaConnectionDetails["metadata"]["authFlow"] },
) {
  const graphBase =
    options?.authFlow === "instagram_login"
      ? "https://graph.instagram.com"
      : `https://graph.facebook.com/${GRAPH_VERSION}`;

  const container = await fetch(`${graphBase}/${instagramAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: content,
      access_token: pageAccessToken,
    }),
  });

  if (!container.ok) {
    const detail = await readGraphError(container);
    throw new Error(`Instagram media container failed: ${detail}`);
  }

  const containerPayload = (await container.json()) as { id?: string };
  if (!containerPayload.id) {
    throw new Error("Instagram media container missing id");
  }

  await waitForInstagramContainer(graphBase, pageAccessToken, containerPayload.id);

  const publish = await fetch(`${graphBase}/${instagramAccountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerPayload.id,
      access_token: pageAccessToken,
    }),
  });

  if (!publish.ok) {
    const detail = await readGraphError(publish);
    throw new Error(`Instagram publish failed: ${detail}`);
  }

  const publishPayload = (await publish.json()) as { id?: string };
  const mediaId = publishPayload.id;
  if (!mediaId) {
    throw new Error("Instagram publish response missing id");
  }

  const permalink = await fetchInstagramPermalink(graphBase, mediaId, pageAccessToken);
  return permalink;
}

async function fetchInstagramPermalink(
  graphBase: string,
  mediaId: string,
  accessToken: string,
) {
  const url = new URL(`${graphBase}/${mediaId}`);
  url.searchParams.set("fields", "permalink");
  url.searchParams.set("access_token", accessToken);

  const response = await fetch(url);
  if (!response.ok) {
    return mediaId;
  }

  const payload = (await response.json()) as { permalink?: string };
  return payload.permalink ?? mediaId;
}
