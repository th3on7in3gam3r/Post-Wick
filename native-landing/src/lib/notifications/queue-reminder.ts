import { getPendingPostsByUserId, getUsersForQueueReminders } from "@/lib/db";
import { sendQueueReminderEmail } from "@/lib/email/queue-reminder";
import { resolveUserEmail } from "@/lib/notifications/resolve-user-email";

export type QueueReminderRunResult = {
  eligibleUsers: number;
  sent: number;
  skippedNoPending: number;
  skippedNoEmail: number;
  failed: number;
};

export async function sendQueueRemindersToAllUsers(): Promise<QueueReminderRunResult> {
  const users = await getUsersForQueueReminders();

  let sent = 0;
  let skippedNoPending = 0;
  let skippedNoEmail = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const pending = await getPendingPostsByUserId(user.id);
      if (pending.length === 0) {
        skippedNoPending += 1;
        continue;
      }

      const { email, displayName } = await resolveUserEmail(user.id, user.email);
      if (!email) {
        skippedNoEmail += 1;
        continue;
      }

      const result = await sendQueueReminderEmail({
        to: email,
        displayName,
        pendingCount: pending.length,
        posts: pending.map((post) => ({
          platform: post.platform,
          brandName: post.brandName,
          content: post.content,
        })),
      });

      if (result.sent) {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      console.error("[queue-reminder] failed for user", user.id, error);
      failed += 1;
    }
  }

  return {
    eligibleUsers: users.length,
    sent,
    skippedNoPending,
    skippedNoEmail,
    failed,
  };
}
