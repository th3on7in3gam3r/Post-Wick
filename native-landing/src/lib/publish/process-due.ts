import {
  getConnectionForBrand,
  getDuePosts,
  markPostFailed,
  markPostPublished,
} from "@/lib/db";
import { publishToLinkedIn } from "@/lib/social/linkedin";

export async function processDuePostsForUser(userId: string) {
  const duePosts = getDuePosts(userId);
  const results: Array<{ postId: string; status: "published" | "failed" }> = [];

  for (const post of duePosts) {
    const connection = getConnectionForBrand(post.brandId, post.platform);

    if (!connection) {
      markPostFailed(post.id, userId, "No connected account for this platform");
      results.push({ postId: post.id, status: "failed" });
      continue;
    }

    try {
      if (connection.isDemo) {
        markPostPublished(post.id, userId, `demo-${post.id}`);
        results.push({ postId: post.id, status: "published" });
        continue;
      }

      if (post.platform.toLowerCase() === "linkedin" && connection.accessToken) {
        const externalId = await publishToLinkedIn(connection.accessToken, post.content);
        markPostPublished(post.id, userId, externalId);
        results.push({ postId: post.id, status: "published" });
        continue;
      }

      markPostFailed(post.id, userId, `Publishing for ${post.platform} is not configured yet`);
      results.push({ postId: post.id, status: "failed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Publish failed";
      markPostFailed(post.id, userId, message);
      results.push({ postId: post.id, status: "failed" });
    }
  }

  return results;
}
