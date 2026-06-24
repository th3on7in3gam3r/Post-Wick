import {
  getConnectionForBrand,
  getDuePosts,
  getUserIdsWithDuePosts,
  markPostFailed,
  markPostPublished,
  type ConnectionRecord,
} from "@/lib/db";
import { publishToLinkedIn } from "@/lib/social/linkedin";
import {
  publishToFacebookPage,
  publishToInstagram,
} from "@/lib/social/meta";
import { resolvePostImageUrl } from "@/lib/posts/image-url";

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
) {
  const platform = post.platform.toLowerCase();

  if (platform === "linkedin" && connection.accessToken) {
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
    return publishToFacebookPage(connection.accessToken, metadata.pageId, post.content);
  }

  if (platform === "instagram" && connection.accessToken) {
    const metadata = parseMetadata(connection);
    if (!metadata?.instagramAccountId) {
      throw new Error("Instagram Business account metadata is missing");
    }
    if (!post.imageUrl) {
      throw new Error("Instagram posts require an image. Refine this post with an image first.");
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

  throw new Error(`Live publishing for ${post.platform} is not available yet`);
}

export async function processDuePostsForUser(userId: string) {
  const duePosts = await getDuePosts(userId);
  const results: Array<{ postId: string; status: "published" | "failed" }> = [];

  for (const post of duePosts) {
    const connection = await getConnectionForBrand(post.brandId, post.platform);

    if (!connection) {
      await markPostFailed(post.id, userId, "No connected account for this platform");
      results.push({ postId: post.id, status: "failed" });
      continue;
    }

    try {
      if (connection.isDemo) {
        await markPostPublished(post.id, userId, `demo-${post.id}`);
        results.push({ postId: post.id, status: "published" });
        continue;
      }

      const externalId = await publishLivePost(post, connection);
      await markPostPublished(post.id, userId, externalId);
      results.push({ postId: post.id, status: "published" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      await markPostFailed(post.id, userId, message);
      results.push({ postId: post.id, status: "failed" });
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
