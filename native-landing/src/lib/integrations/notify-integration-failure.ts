import { clerkClient } from "@clerk/nextjs/server";
import {
  getBrandById,
  getConnectionForBrand,
  getOrCreateUser,
  upsertConnection,
  type ConnectionRecord,
} from "@/lib/db";
import { sendIntegrationFailureEmails } from "@/lib/email/integration-alert";
import { isIntegrationAuthFailure } from "@/lib/integrations/auth-failure";
import {
  mergeConnectionMetadata,
  parseConnectionMetadata,
  type ConnectionHealthFields,
} from "@/lib/integrations/connection-metadata";

const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

async function resolveUserEmail(userId: string) {
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const primary =
      clerkUser.emailAddresses.find(
        (entry) => entry.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    if (primary?.trim()) return primary.trim();
  } catch {
    // fall back to stored profile email
  }

  const dbUser = await getOrCreateUser(userId);
  return dbUser.email?.trim() || null;
}

function shouldSendAlert(metadata: ConnectionHealthFields, error: string) {
  if (!metadata.lastAlertSentAt) return true;
  if (metadata.lastAlertError !== error) return true;
  const lastSent = Date.parse(metadata.lastAlertSentAt);
  if (Number.isNaN(lastSent)) return true;
  return Date.now() - lastSent >= ALERT_COOLDOWN_MS;
}

export async function notifyIntegrationFailureIfNeeded(input: {
  userId: string;
  brandId: string;
  platform: string;
  accountName: string | null;
  error: string;
  context: "publish" | "verify";
  connection?: ConnectionRecord | null;
}) {
  if (!isIntegrationAuthFailure(input.error)) {
    return { notified: false as const, reason: "not_auth_failure" };
  }

  const dbUser = await getOrCreateUser(input.userId);
  if (input.context === "publish" && !dbUser.notifyPublish) {
    return { notified: false as const, reason: "user_opted_out" };
  }

  const connection =
    input.connection ??
    (await getConnectionForBrand(input.brandId, input.platform));
  const healthMeta = parseConnectionMetadata<ConnectionHealthFields>(
    connection?.metadata ?? null,
  );

  if (!shouldSendAlert(healthMeta, input.error)) {
    return { notified: false as const, reason: "cooldown" };
  }

  const brand = await getBrandById(input.brandId, input.userId);
  const userEmail = await resolveUserEmail(input.userId);

  await sendIntegrationFailureEmails({
    userEmail,
    brandName: brand?.name ?? "your brand",
    platform: input.platform,
    accountName: input.accountName,
    error: input.error,
    context: input.context,
  });

  if (connection) {
    const now = new Date().toISOString();
    await upsertConnection({
      id: connection.id,
      userId: connection.userId,
      brandId: connection.brandId,
      platform: connection.platform,
      accountName: connection.accountName ?? undefined,
      metadata: mergeConnectionMetadata(connection.metadata, {
        healthStatus: "error",
        lastHealthError: input.error,
        lastAlertSentAt: now,
        lastAlertError: input.error,
      }),
      isDemo: connection.isDemo,
    });
  }

  return { notified: true as const };
}
