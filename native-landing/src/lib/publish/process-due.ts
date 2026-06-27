import {
  claimDuePostForPublishing,
  finalizePublishedPost,
  getBrandById,
  getConnectionForBrand,
  getDuePosts,
  getUserIdsWithDuePosts,
  markPostFailed,
  upsertConnection,
  type ConnectionRecord,
} from "@/lib/db";
import { publishToLinkedIn } from "@/lib/social/linkedin";
import {
  publishToFacebookPage,
  publishToInstagram,
} from "@/lib/social/meta";
import {
  parsePinterestMetadata,
  publishToPinterest,
  resolvePinterestAccessToken,
} from "@/lib/social/pinterest";
import { parseXMetadata, publishToX } from "@/lib/social/x";
import { postHasBrokenImageUrl, postNeedsRepair, resolvePostImageUrl } from "@/lib/posts/image-url";

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
    const externalId = await publishToLinkedIn(
      connection.accessToken,
      post.content,
      imageUrl,
    );
    return externalId;
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
    const resolved = await resolvePinterestAccessToken(
      connection.accessToken,
      metadata,
    );

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

  throw new Error(`Live publishing for ${post.platform} is not available yet`);
}

export async function processDuePostsForUser(userId: string) {
  const duePosts = await getDuePosts(userId);
  const results: Array<{ postId: string; status: "published" | "failed" }> = [];

  for (const post of duePosts) {
    const claimed = await claimDuePostForPublishing(post.id, userId);
    if (!claimed) {
      continue;
    }

    const connection = await getConnectionForBrand(claimed.brandId, claimed.platform);

    if (!connection) {
      await markPostFailed(claimed.id, userId, "No connected account for this platform");
      results.push({ postId: claimed.id, status: "failed" });
      continue;
    }

    try {
      if (connection.isDemo) {
        await finalizePublishedPost(claimed.id, userId, `demo-${claimed.id}`);
        results.push({ postId: claimed.id, status: "published" });
        continue;
      }

      const externalId = await publishLivePost(claimed, connection, userId);
      await finalizePublishedPost(claimed.id, userId, externalId);
      results.push({ postId: claimed.id, status: "published" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      await markPostFailed(claimed.id, userId, message);
      results.push({ postId: claimed.id, status: "failed" });
    }
  }

  return results;
}

export async function processDuePostsForAllUsers() {
  const userIds = await getUserIdsWithDuePosts();
  let published = 0;
  let failed = 0;

  for (const userId of userIds) {
    const results = await processDuePostsForUser(userId);
    for (const result of results) {
      if (result.status === "published") published += 1;
      else failed += 1;
    }
  }

  return {
    usersProcessed: userIds.length,
    published,
    failed,
  };
}
