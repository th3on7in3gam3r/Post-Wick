import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  getAnalyticsSummary,
  getBrandByWebsite,
  getBrandsByUserId,
  getDashboardStats,
  getPendingPostsByUserId,
  getOrCreateUser,
  getRecentActivity,
  getScheduledPostsByUserId,
  userHasConnections,
} from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { processDuePostsForUser } from "@/lib/publish/process-due";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}

export async function getAppContext(urlParam?: string) {
  const userId = await requireUserId();
  await processDuePostsForUser(userId);

  const clerkUser = await currentUser();
  const dbUser = await getOrCreateUser(
    userId,
    clerkUser?.emailAddresses[0]?.emailAddress ?? null,
  );
  const plan = getPlanLimits(dbUser.subscriptionTier);

  const websiteUrl = urlParam ? normalizeWebsiteUrl(urlParam) : null;
  const brands = await getBrandsByUserId(userId);
  const stats = await getDashboardStats(userId);
  const pendingPosts = (await getPendingPostsByUserId(userId)).slice(0, 5);
  const scheduledPosts = await getScheduledPostsByUserId(userId, 5);
  const recentActivity = await getRecentActivity(userId, 6);
  const analytics = await getAnalyticsSummary(userId);
  const hasConnections = await userHasConnections(userId);
  const primaryBrand =
    (websiteUrl ? await getBrandByWebsite(userId, websiteUrl) : null) ?? brands[0] ?? null;

  return {
    userId,
    dbUser,
    plan,
    websiteUrl,
    brands,
    stats,
    pendingPosts,
    scheduledPosts,
    recentActivity,
    analytics,
    hasConnections,
    primaryBrand,
  };
}
