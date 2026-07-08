import { clerkClient } from "@clerk/nextjs/server";

export async function resolveUserEmail(
  userId: string,
  fallbackEmail: string | null,
): Promise<{ email: string | null; displayName: string | null }> {
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const primary =
      clerkUser.emailAddresses.find(
        (entry) => entry.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
    const displayName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
      clerkUser.username ||
      null;
    if (primary?.trim()) {
      return { email: primary.trim(), displayName };
    }
    return { email: fallbackEmail?.trim() || null, displayName };
  } catch {
    return { email: fallbackEmail?.trim() || null, displayName: null };
  }
}
