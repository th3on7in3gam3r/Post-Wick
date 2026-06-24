"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  ListChecks,
  RotateCw,
  Send,
} from "lucide-react";
import { ActiveClientBanner, useClientFilteredPosts } from "@/components/app/client-scoped";
import { ActivityFeed, ActivityFeedFooter } from "@/components/app/activity-feed";
import { EmptyState } from "@/components/app/empty-state";
import { GettingStartedCard } from "@/components/app/getting-started-card";
import { PanelCard } from "@/components/app/panel-card";
import { StatCard } from "@/components/app/stat-card";
import { TextureButton } from "@/components/ui/texture-button";
import { RelativeScheduleTime } from "@/components/app/relative-schedule-time";
import { useActiveClient } from "@/components/app/client-context";
import type { ActivityItem, CalendarPost } from "@/lib/db";
import { formatUpdatedAgo } from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

type DashboardPost = CalendarPost & { brandName?: string };

type UpcomingPlatformFilter = "all" | "linkedin" | "instagram" | "facebook";

const UPCOMING_PLATFORM_TABS: {
  id: UpcomingPlatformFilter;
  label: string;
  dotClass: string;
}[] = [
  { id: "all", label: "All", dotClass: "bg-near-black" },
  { id: "linkedin", label: "LinkedIn", dotClass: "bg-[#0A66C2]" },
  { id: "instagram", label: "Instagram", dotClass: "bg-[#E4405F]" },
  { id: "facebook", label: "Facebook", dotClass: "bg-[#1877F2]" },
];

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
  const router = useRouter();
  const { activeClient } = useActiveClient();
  const [lastUpdated, setLastUpdated] = useState(() => Date.now());
  const [timeTick, setTimeTick] = useState(0);
  const [isRefreshing, startRefresh] = useTransition();
  const wasRefreshing = useRef(false);
  const clientPending = useClientFilteredPosts(pendingPosts);
  const clientScheduled = useClientFilteredPosts(scheduledPosts);
  const clientActivity = useClientFilteredPosts(recentActivity);
  const [upcomingPlatformFilter, setUpcomingPlatformFilter] =
    useState<UpcomingPlatformFilter>("all");

  const upcomingPlatformCounts = useMemo(() => {
    const counts = { linkedin: 0, instagram: 0, facebook: 0 };
    for (const post of clientScheduled) {
      if (post.platform in counts) {
        counts[post.platform as keyof typeof counts] += 1;
      }
    }
    return counts;
  }, [clientScheduled]);

  const filteredUpcomingPosts = useMemo(() => {
    if (upcomingPlatformFilter === "all") return clientScheduled;
    return clientScheduled.filter((post) => post.platform === upcomingPlatformFilter);
  }, [clientScheduled, upcomingPlatformFilter]);

  useEffect(() => {
    if (
      upcomingPlatformFilter !== "all" &&
      upcomingPlatformCounts[upcomingPlatformFilter] === 0
    ) {
      setUpcomingPlatformFilter("all");
    }
  }, [upcomingPlatformFilter, upcomingPlatformCounts]);

  useEffect(() => {
    const interval = window.setInterval(() => setTimeTick((value) => value + 1), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (wasRefreshing.current && !isRefreshing) {
      setLastUpdated(Date.now());
    }
    wasRefreshing.current = isRefreshing;
  }, [isRefreshing]);

  function refreshStats() {
    startRefresh(() => {
      router.refresh();
    });
  }

  const updatedLabel = useMemo(
    () => formatUpdatedAgo(lastUpdated),
    [lastUpdated, timeTick],
  );

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

      <div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Scheduled"
            value={clientScheduled.length}
            hint={`For ${activeClient.name}`}
            icon={CalendarDays}
            loading={isRefreshing}
          />
          <StatCard
            label="Awaiting approval"
            value={clientPending.length}
            hint="Ready for your review"
            icon={ListChecks}
            loading={isRefreshing}
          />
          <StatCard
            label="Published"
            value={stats.published}
            hint={`${analytics.publishedThisWeek} this week (all clients)`}
            icon={Send}
            loading={isRefreshing}
          />
        </div>
        <div className="mt-2 flex items-center justify-end gap-2">
          <p className="text-xs text-gray-label" aria-live="polite">
            {updatedLabel}
          </p>
          <button
            type="button"
            onClick={refreshStats}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs text-gray-label transition hover:bg-cream/80 hover:text-near-black disabled:opacity-50"
            aria-label="Refresh dashboard stats"
          >
            <RotateCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              aria-hidden
            />
            <span>Refresh</span>
          </button>
        </div>
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
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 border-b border-black/[0.06] pb-3">
                {UPCOMING_PLATFORM_TABS.map((tab) => {
                  const isAll = tab.id === "all";
                  const isDisabled =
                    !isAll && upcomingPlatformCounts[tab.id as keyof typeof upcomingPlatformCounts] === 0;
                  const isSelected = upcomingPlatformFilter === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => setUpcomingPlatformFilter(tab.id)}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition",
                        isSelected
                          ? "bg-cream text-near-black shadow-sm"
                          : "text-gray-body hover:bg-cream/70",
                        isDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
                      )}
                    >
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", tab.dotClass)}
                        aria-hidden
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {filteredUpcomingPosts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-black/[0.06] bg-cream/50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                        {post.platform}
                      </p>
                      {post.scheduledAt ? (
                        <RelativeScheduleTime
                          iso={post.scheduledAt}
                          className="text-xs text-gray-label"
                        />
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-near-black">{post.content}</p>
                  </article>
                ))}
              </div>
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
