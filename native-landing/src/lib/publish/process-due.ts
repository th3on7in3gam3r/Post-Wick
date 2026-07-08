import {
  claimDuePostForPublishing,
  getDuePosts,
  getUserIdsWithDuePosts,
  type PostRecord,
} from "@/lib/db";
import { notifyPublishSuccessIfNeeded } from "@/lib/notifications/publish-confirmation";
import { attemptPublishClaimedPost } from "@/lib/publish/retry-failed";

export async function processDuePostsForUser(userId: string) {
  const duePosts = await getDuePosts(userId);
  const results: Array<{ postId: string; status: "published" | "failed" }> = [];
  const published: Array<{ post: PostRecord; externalPostId?: string }> = [];

  for (const post of duePosts) {
    const claimed = await claimDuePostForPublishing(post.id, userId);
    if (!claimed) {
      continue;
    }

    const result = await attemptPublishClaimedPost(claimed, userId);
    results.push({ postId: result.postId, status: result.status });
    if (result.status === "published") {
      published.push({ post: claimed, externalPostId: result.externalPostId });
    }
  }

  if (published.length > 0) {
    void notifyPublishSuccessIfNeeded(userId, published).catch((error) => {
      console.error("[publish-confirmation]", error);
    });
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
