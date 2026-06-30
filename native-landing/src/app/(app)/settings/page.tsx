import { currentUser } from "@clerk/nextjs/server";
import { SettingsClient } from "@/components/app/settings-client";
import { SettingsShell } from "@/components/app/settings-shell";
import {
  countConnectionsByUserId,
  getBrandsByUserId,
  getOrCreateUser,
} from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [clerkUser, dbUser, brands, connectionCount] = await Promise.all([
    currentUser(),
    getOrCreateUser(userId),
    getBrandsByUserId(userId),
    countConnectionsByUserId(userId),
  ]);

  return (
    <SettingsShell
      title="Settings"
      description="Workspace preferences, notifications, and account controls."
    >
      <SettingsClient
        profile={{
          fullName: clerkUser?.fullName ?? null,
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? dbUser.email,
          imageUrl: clerkUser?.imageUrl ?? null,
          memberSince: dbUser.createdAt,
        }}
        workspace={{
          tier: dbUser.subscriptionTier,
          brandCount: brands.length,
          connectionCount,
        }}
        initialSettings={{
          timezone: dbUser.timezone,
          defaultPostingFrequency: dbUser.defaultPostingFrequency,
          notifyQueue: dbUser.notifyQueue,
          notifyPublish: dbUser.notifyPublish,
          notifyWeeklyDigest: dbUser.notifyWeeklyDigest,
          demoModeEnabled: dbUser.demoModeEnabled,
        }}
      />
    </SettingsShell>
  );
}
