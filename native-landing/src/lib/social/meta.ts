export type MetaPlatform = "instagram" | "facebook";

export type MetaConnectionDetails = {
  accountName: string;
  accessToken: string;
  metadata: {
    pageId: string;
    pageName: string;
    instagramAccountId?: string;
    instagramUsername?: string;
  };
};

const GRAPH_VERSION = "v21.0";

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export function metaRedirectUri() {
  return `${appBaseUrl()}/api/social/meta/callback`;
}

export function isMetaConfigured() {
  return Boolean(
    process.env.META_APP_ID?.trim() && process.env.META_APP_SECRET?.trim(),
  );
}

export function getMetaAuthUrl(brandId: string, platform: MetaPlatform) {
  const appId = process.env.META_APP_ID;
  if (!appId) {
    throw new Error("Meta OAuth is not configured");
  }

  const scopes =
    platform === "instagram"
      ? [
          "instagram_basic",
          "instagram_content_publish",
          "pages_show_list",
          "pages_read_engagement",
        ]
      : ["pages_show_list", "pages_manage_posts", "pages_read_engagement"];

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: metaRedirectUri(),
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

export async function exchangeMetaCode(code: string) {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) {
    throw new Error("Meta OAuth is not configured");
  }

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: metaRedirectUri(),
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
      },
    };
  }

  return {
    accountName: page.name,
    accessToken: page.access_token,
    metadata: {
      pageId: page.id,
      pageName: page.name,
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
  pageAccessToken: string,
  containerId: string,
) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const response = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${containerId}?fields=status_code&access_token=${pageAccessToken}`,
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
) {
  const container = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${instagramAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: content,
        access_token: pageAccessToken,
      }),
    },
  );

  if (!container.ok) {
    const detail = await readGraphError(container);
    throw new Error(`Instagram media container failed: ${detail}`);
  }

  const containerPayload = (await container.json()) as { id?: string };
  if (!containerPayload.id) {
    throw new Error("Instagram media container missing id");
  }

  await waitForInstagramContainer(pageAccessToken, containerPayload.id);

  const publish = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${instagramAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerPayload.id,
        access_token: pageAccessToken,
      }),
    },
  );

  if (!publish.ok) {
    const detail = await readGraphError(publish);
    throw new Error(`Instagram publish failed: ${detail}`);
  }

  const publishPayload = (await publish.json()) as { id?: string };
  return publishPayload.id ?? "instagram-post";
}
