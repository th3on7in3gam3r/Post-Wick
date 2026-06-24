import { redirect } from "next/navigation";
import { AppHeaderWithClient } from "@/components/app/client-scoped";
import { DashboardClientView } from "@/components/app/dashboard-client-view";
import { DashboardGenerateAction } from "@/components/app/dashboard-generate-action";
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
    pendingPosts,
    scheduledPosts,
    recentActivity,
    analytics,
    hasConnections,
    plan,
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
        title="Dashboard"
        description="your autopilot command center"
        action={<DashboardGenerateAction generateMax={plan.generateMax} />}
      />
      <DashboardClientView
        stats={stats}
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
