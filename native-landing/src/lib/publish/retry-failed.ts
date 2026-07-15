import {
  claimFailedPostForRetry,
  finalizePublishedPost,
  getBrandById,
  getConnectionForBrand,
  getPostHistory,
  markPostFailed,
  upsertConnection,
  type ConnectionRecord,
  type PostRecord,
} from "@/lib/db";
import {
  blueskyPostUrl,
  parseBlueskyMetadata,
  publishToBluesky,
  resolveBlueskyDid,
} from "@/lib/social/bluesky";
import { publishToLinkedIn } from "@/lib/social/linkedin";
import { publishToFacebookPage, publishToInstagram } from "@/lib/social/meta";
import {
  parsePinterestMetadata,
  publishToPinterest,
  resolvePinterestAccessToken,
} from "@/lib/social/pinterest";
import { parseXMetadata, publishToX } from "@/lib/social/x";
import { notifyIntegrationFailureIfNeeded } from "@/lib/integrations/notify-integration-failure";
import { notifyPublishSuccessIfNeeded } from "@/lib/notifications/publish-confirmation";
import {
  postHasBrokenImageUrl,
  postNeedsRepair,
  resolvePostImageUrl,
} from "@/lib/posts/image-url";

export type RetryPublishResult = {
  postId: string;
  status: "published" | "failed";
  externalPostId?: string;
  error?: string;
};

type MetaMetadata = {
  pageId?: string;
  instagramAccountId?: string;
  authFlow?: "instagram_login" | "facebook_login";
};

function parseMetadata(connection: ConnectionRecord): MetaMetadata | null {
  if (!connection.metadata) return null;
  try {
    return JSON.parse(connection.metadata) as MetaMetadata;
  } catch {
    return null;
  }
}

async function publishLivePost(
  post: { id: string; brandId: string; platform: string; content: string; imageUrl: string | null },
  connection: ConnectionRecord,
  userId: string,
) {
  const platform = post.platform.toLowerCase();

  if (platform === "linkedin" && connection.accessToken) {
    if (post.imageUrl && postHasBrokenImageUrl(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }
    const imageUrl = resolvePostImageUrl(post.imageUrl);
    return publishToLinkedIn(connection.accessToken, post.content, imageUrl);
  }

  if (platform === "facebook" && connection.accessToken) {
    const metadata = parseMetadata(connection);
    if (!metadata?.pageId) {
      throw new Error("Facebook Page metadata is missing for this connection");
    }
    if (post.imageUrl && postHasBrokenImageUrl(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }
    const imageUrl = post.imageUrl ? resolvePostImageUrl(post.imageUrl) : null;
    return publishToFacebookPage(
      connection.accessToken,
      metadata.pageId,
      post.content,
      imageUrl,
    );
  }

  if (platform === "instagram" && connection.accessToken) {
    const metadata = parseMetadata(connection);
    if (!metadata?.instagramAccountId) {
      throw new Error("Instagram Business account metadata is missing");
    }
    if (!post.imageUrl) {
      throw new Error("Instagram posts require an image. Refine this post with an image first.");
    }
    if (postNeedsRepair(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }
    const imageUrl = resolvePostImageUrl(post.imageUrl);
    if (!imageUrl) {
      throw new Error("Instagram image URL is invalid.");
    }
    return publishToInstagram(
      connection.accessToken,
      metadata.instagramAccountId,
      post.content,
      imageUrl,
      { authFlow: metadata.authFlow },
    );
  }

  if (platform === "twitter" && connection.accessToken) {
    if (post.imageUrl && postHasBrokenImageUrl(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }
    const imageUrl = post.imageUrl ? resolvePostImageUrl(post.imageUrl) : null;
    const xMetadata = parseXMetadata(connection.metadata);
    const result = await publishToX(
      connection.accessToken,
      post.content,
      imageUrl,
      xMetadata,
    );

    if (
      result.accessToken !== connection.accessToken ||
      JSON.stringify(result.metadata) !== JSON.stringify(xMetadata)
    ) {
      await upsertConnection({
        id: connection.id,
        userId: connection.userId,
        brandId: connection.brandId,
        platform: connection.platform,
        accountName: connection.accountName ?? undefined,
        accessToken: result.accessToken,
        metadata: result.metadata ?? undefined,
        isDemo: false,
      });
    }

    return result.externalId;
  }

  if (platform === "pinterest" && connection.accessToken) {
    const metadata = parsePinterestMetadata(connection.metadata);
    if (!metadata?.boardId) {
      throw new Error("Pinterest board metadata is missing for this connection");
    }
    if (!post.imageUrl) {
      throw new Error("Pinterest pins require an image. Refine this post with an image first.");
    }
    if (postNeedsRepair(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }

    const imageUrl = resolvePostImageUrl(post.imageUrl);
    if (!imageUrl) {
      throw new Error("Pinterest image URL is invalid.");
    }

    const brand = await getBrandById(post.brandId, userId);
    const resolved = await resolvePinterestAccessToken(connection.accessToken, metadata);

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
        isDemo: false,
      });
    }

    return publishToPinterest(
      resolved.accessToken,
      resolved.metadata ?? metadata,
      post.content,
      imageUrl,
      brand?.websiteUrl ?? null,
    );
  }

  if (platform === "bluesky") {
    const did = resolveBlueskyDid(connection);
    if (!did) {
      throw new Error("Bluesky DID is missing for this connection. Disconnect and reconnect.");
    }
    if (post.imageUrl && postHasBrokenImageUrl(post.imageUrl)) {
      throw new Error(
        "Post image is not in cloud storage. Open Brands and click Fix images before publishing.",
      );
    }
    const imageUrl = post.imageUrl ? resolvePostImageUrl(post.imageUrl) : null;
    const uri = await publishToBluesky({
      did,
      content: post.content,
      imageUrl,
    });
    const handle = parseBlueskyMetadata(connection.metadata)?.handle;
    return blueskyPostUrl(uri, handle ?? did);
  }

  throw new Error(`Live publishing for ${post.platform} is not available yet`);
}

export async function attemptPublishClaimedPost(
  claimed: PostRecord,
  userId: string,
): Promise<RetryPublishResult> {
  const connection = await getConnectionForBrand(claimed.brandId, claimed.platform);

  if (!connection) {
    const error = "No connected account for this platform";
    await markPostFailed(claimed.id, userId, error);

    void notifyIntegrationFailureIfNeeded({
      userId,
      brandId: claimed.brandId,
      platform: claimed.platform,
      accountName: null,
      error,
      context: "publish",
    }).catch((notifyError) => {
      console.error("[publish-notify]", notifyError);
    });

    return { postId: claimed.id, status: "failed", error };
  }

  try {
    if (connection.isDemo) {
      const externalPostId = `demo-${claimed.id}`;
      await finalizePublishedPost(claimed.id, userId, externalPostId);
      return { postId: claimed.id, status: "published", externalPostId };
    }

    const externalPostId = await publishLivePost(claimed, connection, userId);
    await finalizePublishedPost(claimed.id, userId, externalPostId);
    return { postId: claimed.id, status: "published", externalPostId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publish failed";
    await markPostFailed(claimed.id, userId, message);

    void notifyIntegrationFailureIfNeeded({
      userId,
      brandId: claimed.brandId,
      platform: claimed.platform,
      accountName: connection.accountName,
      error: message,
      context: "publish",
      connection,
    }).catch((notifyError) => {
      console.error("[publish-notify]", notifyError);
    });

    return { postId: claimed.id, status: "failed", error: message };
  }
}

export async function retryFailedPost(
  postId: string,
  userId: string,
): Promise<RetryPublishResult> {
  const claimed = await claimFailedPostForRetry(postId, userId);
  if (!claimed) {
    return {
      postId,
      status: "failed",
      error: "Post not found or is not in failed status",
    };
  }

  const result = await attemptPublishClaimedPost(claimed, userId);
  if (result.status === "published") {
    void notifyPublishSuccessIfNeeded(userId, [
      { post: claimed, externalPostId: result.externalPostId },
    ]).catch((notifyError) => {
      console.error("[publish-confirmation]", notifyError);
    });
  }

  return result;
}

export async function retryAllFailedPosts(userId: string): Promise<RetryPublishResult[]> {
  const failedPosts = await getPostHistory(userId, "failed", 100);
  const results: RetryPublishResult[] = [];
  const published: Array<{ post: PostRecord; externalPostId?: string }> = [];

  for (const post of failedPosts) {
    const claimed = await claimFailedPostForRetry(post.id, userId);
    if (!claimed) {
      results.push({
        postId: post.id,
        status: "failed",
        error: "Post not found or is not in failed status",
      });
      continue;
    }

    const result = await attemptPublishClaimedPost(claimed, userId);
    results.push(result);
    if (result.status === "published") {
      published.push({ post: claimed, externalPostId: result.externalPostId });
    }
  }

  if (published.length > 0) {
    void notifyPublishSuccessIfNeeded(userId, published).catch((notifyError) => {
      console.error("[publish-confirmation]", notifyError);
    });
  }

  return results;
}
