import { getUsersForWeeklyDigest, getWeeklyDigestForUser } from "@/lib/db";
import { sendWeeklyDigestEmail } from "@/lib/email/weekly-digest";
import { resolveUserEmail } from "@/lib/notifications/resolve-user-email";

export type WeeklyDigestRunResult = {
  eligibleUsers: number;
  sent: number;
  skippedNoContent: number;
  skippedNoEmail: number;
  failed: number;
};

export async function sendWeeklyDigestToAllUsers(): Promise<WeeklyDigestRunResult> {
  const users = await getUsersForWeeklyDigest();

  let sent = 0;
  let skippedNoContent = 0;
  let skippedNoEmail = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const data = await getWeeklyDigestForUser(user.id);

      const hasActivity =
        data.publishedCount > 0 ||
        data.scheduledCount > 0 ||
        data.pendingCount > 0 ||
        data.failedCount > 0;

      if (!hasActivity) {
        skippedNoContent += 1;
        continue;
      }

      const { email, displayName } = await resolveUserEmail(user.id, user.email);
      if (!email) {
        skippedNoEmail += 1;
        continue;
      }

      const result = await sendWeeklyDigestEmail({ to: email, displayName, data });
      if (result.sent) {
        sent += 1;
      } else {
        failed += 1;
      }
    } catch (error) {
      console.error("[weekly-digest] failed for user", user.id, error);
      failed += 1;
    }
  }

  return {
    eligibleUsers: users.length,
    sent,
    skippedNoContent,
    skippedNoEmail,
    failed,
  };
}
