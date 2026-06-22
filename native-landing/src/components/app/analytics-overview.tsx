import Link from "next/link";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Send,
  XCircle,
} from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { StatCard } from "@/components/app/stat-card";
import { TextureButton } from "@/components/ui/texture-button";
import type { AnalyticsSummary } from "@/lib/db";

function WeeklyChart({ data }: { data: AnalyticsSummary["weeklyPublished"] }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-body">
        Published posts will appear here once autopilot goes live.
      </p>
    );
  }

  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div className="flex h-28 w-full items-end justify-center">
            <div
              className="w-full max-w-[2.5rem] rounded-t-lg bg-gold/80"
              style={{ height: `${Math.max((item.count / max) * 100, 8)}%` }}
              title={`${item.count} posts`}
            />
          </div>
          <span className="text-[0.65rem] text-gray-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsOverview({ analytics }: { analytics: AnalyticsSummary }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Published"
          value={analytics.published}
          hint={`${analytics.publishedThisWeek} this week`}
          icon={Send}
        />
        <StatCard
          label="Approval rate"
          value={`${analytics.approvalRate}%`}
          hint="Approved vs skipped"
          icon={CheckCircle2}
        />
        <StatCard
          label="Scheduled"
          value={analytics.scheduled}
          hint="Waiting to publish"
          icon={Clock3}
        />
        <StatCard
          label="Failed"
          value={analytics.failed}
          hint="Need attention"
          icon={XCircle}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PanelCard
          title="Publishing trend"
          description="Posts published over the last 8 weeks."
        >
          <WeeklyChart data={analytics.weeklyPublished} />
        </PanelCard>

        <PanelCard title="Pipeline snapshot" description="Where your content stands today.">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-cream/60 px-4 py-3">
              <dt className="text-gray-body">Awaiting approval</dt>
              <dd className="font-medium text-near-black">{analytics.pending}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream/60 px-4 py-3">
              <dt className="text-gray-body">Scheduled</dt>
              <dd className="font-medium text-near-black">{analytics.scheduled}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream/60 px-4 py-3">
              <dt className="text-gray-body">Skipped</dt>
              <dd className="font-medium text-near-black">{analytics.skipped}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-cream/60 px-4 py-3">
              <dt className="text-gray-body">Published this month</dt>
              <dd className="font-medium text-near-black">{analytics.publishedThisMonth}</dd>
            </div>
          </dl>
        </PanelCard>
      </div>

      <PanelCard
        title="By platform"
        description="How content is distributed across channels."
        action={
          <TextureButton asChild variant="minimal" size="sm">
            <Link href="/history">View history</Link>
          </TextureButton>
        }
      >
        {analytics.byPlatform.length === 0 ? (
          <p className="text-sm text-gray-body">No posts generated yet.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {analytics.byPlatform.map((item) => (
              <div
                key={item.platform}
                className="rounded-xl border border-black/[0.06] bg-cream/50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium capitalize text-near-black">
                    {item.platform}
                  </p>
                  <BarChart3 className="h-4 w-4 text-gold" />
                </div>
                <p className="mt-2 text-xs text-gray-body">
                  {item.published} published · {item.total} total
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{
                      width: `${item.total > 0 ? Math.round((item.published / item.total) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>
    </div>
  );
}
