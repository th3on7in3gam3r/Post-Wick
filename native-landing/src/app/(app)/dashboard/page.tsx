import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/app/dashboard-header";
import { DashboardClientView } from "@/components/app/dashboard-client-view";
import { getAppContext } from "@/lib/server/app-data";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { url?: string; brand?: string };
}) {
  const {
    websiteUrl,
    brands,
    stats,
    publishedByBrand,
    pendingPosts,
    scheduledPosts,
    recentActivity,
    analytics,
    hasConnections,
    dbUser,
  } = await getAppContext(searchParams.url);

  if (brands.length === 0) {
    const target = websiteUrl
      ? `/onboarding?url=${encodeURIComponent(websiteUrl)}`
      : "/onboarding";
    redirect(target);
  }

  return (
    <>
      <DashboardHeader timeZone={dbUser.timezone} hasBrands={brands.length > 0} />
      <DashboardClientView
        stats={stats}
        publishedByBrand={publishedByBrand}
        analytics={analytics}
        pendingPosts={pendingPosts}
        scheduledPosts={scheduledPosts}
        recentActivity={recentActivity}
        hasConnections={hasConnections}
        brandCount={brands.length}
      />
    </>
  );
}
