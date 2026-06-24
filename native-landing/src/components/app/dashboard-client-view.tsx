"use client";

import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Send,
} from "lucide-react";
import { ActiveClientBanner, useClientFilteredPosts } from "@/components/app/client-scoped";
import { ActivityFeed, ActivityFeedFooter } from "@/components/app/activity-feed";
import { EmptyState } from "@/components/app/empty-state";
import { GettingStartedCard } from "@/components/app/getting-started-card";
import { PanelCard } from "@/components/app/panel-card";
import { StatCard } from "@/components/app/stat-card";
import { TextureButton } from "@/components/ui/texture-button";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { useActiveClient } from "@/components/app/client-context";
import type { ActivityItem, CalendarPost } from "@/lib/db";

type DashboardPost = CalendarPost & { brandName?: string };

type DashboardClientViewProps = {
  stats: {
    scheduled: number;
    pending: number;
    published: number;
  };
  analytics: {
    publishedThisWeek: number;
  };
  pendingPosts: DashboardPost[];
  scheduledPosts: DashboardPost[];
  recentActivity: ActivityItem[];
  hasConnections: boolean;
  brandCount: number;
};

export function DashboardClientView({
  stats,
  analytics,
  pendingPosts,
  scheduledPosts,
  recentActivity,
  hasConnections,
  brandCount,
}: DashboardClientViewProps) {
  const { activeClient } = useActiveClient();
  const clientPending = useClientFilteredPosts(pendingPosts);
  const clientScheduled = useClientFilteredPosts(scheduledPosts);
  const clientActivity = useClientFilteredPosts(recentActivity);

  const setupSteps = [
    { label: "Add your brand website", done: brandCount > 0 },
    { label: "Connect social channels", done: hasConnections },
    {
      label: "Approve your first posts",
      done: clientPending.length === 0 && clientScheduled.length > 0,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
      <ActiveClientBanner />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Scheduled"
          value={clientScheduled.length}
          hint={`For ${activeClient.name}`}
          icon={CalendarDays}
        />
        <StatCard
          label="Awaiting approval"
          value={clientPending.length}
          hint="Ready for your review"
          icon={ListChecks}
        />
        <StatCard
          label="Published"
          value={stats.published}
          hint={`${analytics.publishedThisWeek} this week (all clients)`}
          icon={Send}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PanelCard
          title="Needs your attention"
          description={`Approve posts for ${activeClient.name}.`}
          action={
            <TextureButton asChild variant="minimal" size="sm">
              <Link href="/queue">Open queue</Link>
            </TextureButton>
          }
        >
          {clientPending.length > 0 ? (
            <div className="space-y-3">
              {clientPending.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border border-black/[0.06] bg-cream/50 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                    {post.platform}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-near-black">{post.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="You're all caught up!"
              description="Ready to generate your next batch?"
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <TextureButton asChild variant="primary" size="default">
                    <Link
                      href={
                        activeClient.id ? `/brands/${activeClient.id}` : "/brands"
                      }
                    >
                      Generate more posts
                    </Link>
                  </TextureButton>
                  <TextureButton asChild variant="secondary" size="default">
                    <Link href="/history">View history</Link>
                  </TextureButton>
                </div>
              }
            />
          )}
        </PanelCard>

        <PanelCard
          title="Upcoming this week"
          description="A preview of what autopilot will publish."
          action={
            <TextureButton asChild variant="minimal" size="sm">
              <Link href="/calendar">Open calendar</Link>
            </TextureButton>
          }
        >
          {clientScheduled.length > 0 ? (
            <div className="space-y-3">
              {clientScheduled.map((post) => (
                <article
                  key={post.id}
                  className="rounded-xl border border-black/[0.06] bg-cream/50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                      {post.platform}
                    </p>
                    {post.scheduledAt ? (
                      <p className="text-xs text-gray-label">
                        {formatScheduleLabel(post.scheduledAt)}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-near-black">{post.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Nothing scheduled yet"
              description="Approve posts in your queue and they will appear here."
            />
          )}
        </PanelCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <PanelCard
          title="Recent activity"
          description={`Latest for ${activeClient.name}.`}
          action={
            <TextureButton asChild variant="minimal" size="sm">
              <Link href="/analytics">View analytics</Link>
            </TextureButton>
          }
        >
          <ActivityFeed items={clientActivity} />
          <ActivityFeedFooter />
        </PanelCard>

        <GettingStartedCard steps={setupSteps} />
      </div>
    </div>
  );
}
