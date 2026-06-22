import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { AnalyticsOverview } from "@/components/app/analytics-overview";
import { AppHeader } from "@/components/app/app-header";
import { EmptyState } from "@/components/app/empty-state";
import { TextureButton } from "@/components/ui/texture-button";
import { getAnalyticsSummary } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export default async function AnalyticsPage() {
  const userId = await requireUserId();
  const analytics = getAnalyticsSummary(userId);

  return (
    <>
      <AppHeader
        title="Analytics"
        description="Proof that autopilot is working for your brand."
      />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {analytics.totalPosts === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            description="Generate and approve your first posts to start tracking performance."
            action={
              <TextureButton asChild variant="primary" size="default">
                <Link href="/queue">Open approval queue</Link>
              </TextureButton>
            }
          />
        ) : (
          <AnalyticsOverview analytics={analytics} />
        )}
      </div>
    </>
  );
}
