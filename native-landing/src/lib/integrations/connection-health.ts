import {
  upsertConnection,
  type ConnectionRecord,
} from "@/lib/db";
import {
  mergeConnectionMetadata,
  parseConnectionMetadata,
} from "@/lib/integrations/connection-metadata";
import { notifyIntegrationFailureIfNeeded } from "@/lib/integrations/notify-integration-failure";
import { facebookAppCredentials } from "@/lib/social/meta";
import { parsePinterestMetadata, resolvePinterestAccessToken } from "@/lib/social/pinterest";
import { parseXMetadata, resolveXAccessToken } from "@/lib/social/x";

const GRAPH_VERSION = "v21.0";

type MetaMetadata = {
  pageId?: string;
  instagramAccountId?: string;
  authFlow?: "instagram_login" | "facebook_login";
};

export type VerifyConnectionResult = {
  ok: boolean;
  refreshed: boolean;
  error?: string;
};

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: { message?: string };
      error_message?: string;
    };
    return (
      payload.error?.message ||
      payload.error_message ||
      response.statusText ||
      `HTTP ${response.status}`
    );
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}

function parseMetaMetadata(metadata: string | null): MetaMetadata {
  return parseConnectionMetadata<MetaMetadata>(metadata);
}

async function debugMetaAccessToken(accessToken: string, label: string) {
  const { appId, appSecret } = facebookAppCredentials();
  if (!appId || !appSecret) {
    throw new Error("Meta OAuth is not configured");
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/debug_token`);
  url.searchParams.set("input_token", accessToken);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${label} failed: ${await readApiError(response)}`);
  }

  const payload = (await response.json()) as {
    data?: { is_valid?: boolean; error?: { message?: string } };
  };

  if (!payload.data?.is_valid) {
    throw new Error(
      `${label} failed: ${payload.data?.error?.message ?? "Token is invalid or expired"}`,
    );
  }
}

async function verifyFacebook(connection: ConnectionRecord) {
  const meta = parseMetaMetadata(connection.metadata);
  if (!meta.pageId || !connection.accessToken) {
    throw new Error("Facebook Page metadata is missing for this connection");
  }

  await debugMetaAccessToken(
    connection.accessToken,
    "Facebook connection check",
  );
}

async function verifyInstagram(connection: ConnectionRecord) {
  const meta = parseMetaMetadata(connection.metadata);
  if (!connection.accessToken) {
    throw new Error("Instagram access token is missing for this connection");
  }

  if (meta.authFlow === "instagram_login") {
    const url = new URL("https://graph.instagram.com/me");
    url.searchParams.set("fields", "id,username");
    url.searchParams.set("access_token", connection.accessToken);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Instagram connection check failed: ${await readApiError(response)}`);
    }
    return;
  }

  await debugMetaAccessToken(
    connection.accessToken,
    "Instagram connection check",
  );
}

async function verifyLinkedIn(connection: ConnectionRecord) {
  if (!connection.accessToken) {
    throw new Error("LinkedIn access token is missing for this connection");
  }

  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${connection.accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`LinkedIn connection check failed: ${await readApiError(response)}`);
  }
}

async function verifyX(connection: ConnectionRecord) {
  if (!connection.accessToken) {
    throw new Error("X access token is missing for this connection");
  }

  const metadata = parseXMetadata(connection.metadata);
  const resolved = await resolveXAccessToken(connection.accessToken, metadata);
  const response = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${resolved.accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`X connection check failed: ${await readApiError(response)}`);
  }

  if (
    resolved.accessToken !== connection.accessToken ||
    JSON.stringify(resolved.metadata) !== JSON.stringify(metadata)
  ) {
    await upsertConnection({
      id: connection.id,
      userId: connection.userId,
      brandId: connection.brandId,
      platform: connection.platform,
      accountName: connection.accountName ?? undefined,
      accessToken: resolved.accessToken,
      metadata: resolved.metadata ?? undefined,
      isDemo: connection.isDemo,
    });
    return { refreshed: true };
  }

  return { refreshed: false };
}

async function verifyPinterest(connection: ConnectionRecord) {
  if (!connection.accessToken) {
    throw new Error("Pinterest access token is missing for this connection");
  }

  const metadata = parsePinterestMetadata(connection.metadata);
  const resolved = await resolvePinterestAccessToken(connection.accessToken, metadata);
  const response = await fetch("https://api.pinterest.com/v5/user_account", {
    headers: { Authorization: `Bearer ${resolved.accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Pinterest connection check failed: ${await readApiError(response)}`);
  }

  if (
    resolved.accessToken !== connection.accessToken ||
    JSON.stringify(resolved.metadata) !== JSON.stringify(metadata)
  ) {
    await upsertConnection({
      id: connection.id,
      userId: connection.userId,
      brandId: connection.brandId,
      platform: connection.platform,
      accountName: connection.accountName ?? undefined,
      accessToken: resolved.accessToken,
      metadata: resolved.metadata ?? undefined,
      isDemo: connection.isDemo,
    });
    return { refreshed: true };
  }

  return { refreshed: false };
}

async function persistHealth(
  connection: ConnectionRecord,
  result: { ok: boolean; error?: string },
) {
  const now = new Date().toISOString();
  await upsertConnection({
    id: connection.id,
    userId: connection.userId,
    brandId: connection.brandId,
    platform: connection.platform,
    accountName: connection.accountName ?? undefined,
    metadata: mergeConnectionMetadata(connection.metadata, {
      healthStatus: result.ok ? "ok" : "error",
      lastVerifiedAt: now,
      lastHealthError: result.ok ? null : result.error ?? "Connection check failed",
    }),
    isDemo: connection.isDemo,
  });
}

export async function verifyConnection(
  connection: ConnectionRecord,
): Promise<VerifyConnectionResult> {
  if (connection.isDemo) {
    await persistHealth(connection, { ok: true });
    return { ok: true, refreshed: false };
  }

  if (!connection.accessToken) {
    const error = "No access token stored for this connection";
    await persistHealth(connection, { ok: false, error });
    return { ok: false, refreshed: false, error };
  }

  try {
    const platform = connection.platform.toLowerCase();
    let refreshed = false;

    if (platform === "facebook") {
      await verifyFacebook(connection);
    } else if (platform === "instagram") {
      await verifyInstagram(connection);
    } else if (platform === "linkedin") {
      await verifyLinkedIn(connection);
    } else if (platform === "twitter") {
      const xResult = await verifyX(connection);
      refreshed = xResult.refreshed;
    } else if (platform === "pinterest") {
      const pinterestResult = await verifyPinterest(connection);
      refreshed = pinterestResult.refreshed;
    } else {
      throw new Error(`Connection checks are not available for ${connection.platform}`);
    }

    await persistHealth(connection, { ok: true });
    return { ok: true, refreshed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection check failed";
    await persistHealth(connection, { ok: false, error: message });

    void notifyIntegrationFailureIfNeeded({
      userId: connection.userId,
      brandId: connection.brandId,
      platform: connection.platform,
      accountName: connection.accountName,
      error: message,
      context: "verify",
      connection,
    }).catch((notifyError) => {
      console.error("[verify-connection-notify]", notifyError);
    });

    return { ok: false, refreshed: false, error: message };
  }
}
