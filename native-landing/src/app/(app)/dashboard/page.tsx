import { redirect } from "next/navigation";
import { AppHeaderWithClient } from "@/components/app/client-scoped";
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
  } = await getAppContext(searchParams.url);

  if (brands.length === 0) {
    const target = websiteUrl
      ? `/onboarding?url=${encodeURIComponent(websiteUrl)}`
      : "/onboarding";
    redirect(target);
  }

  return (
    <>
      <AppHeaderWithClient
        clientAsTitle
        description="Autopilot command center"
      />
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
