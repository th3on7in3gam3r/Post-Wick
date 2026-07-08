import { getBrandById, getOrCreateUser, type PostRecord } from "@/lib/db";
import { sendPublishConfirmationEmail } from "@/lib/email/publish-confirmation";
import { resolveUserEmail } from "@/lib/notifications/resolve-user-email";

export async function notifyPublishSuccessIfNeeded(
  userId: string,
  published: Array<{ post: PostRecord; externalPostId?: string }>,
) {
  if (published.length === 0) {
    return { notified: false as const, reason: "no_posts" };
  }

  const user = await getOrCreateUser(userId);
  if (!user.notifyPublish) {
    return { notified: false as const, reason: "user_opted_out" };
  }

  const summaries = await Promise.all(
    published.map(async ({ post }) => {
      const brand = await getBrandById(post.brandId, userId);
      return {
        platform: post.platform,
        brandName: brand?.name ?? "your brand",
        content: post.content,
      };
    }),
  );

  const { email, displayName } = await resolveUserEmail(userId, user.email);
  if (!email) {
    return { notified: false as const, reason: "no_email" };
  }

  const result = await sendPublishConfirmationEmail({
    to: email,
    displayName,
    posts: summaries,
  });

  if (!result.sent) {
    return { notified: false as const, reason: result.reason };
  }

  return { notified: true as const };
}
