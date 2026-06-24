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
import type { ActivityItem, CalendarPost, PublishedBrandStats } from "@/lib/db";
import { formatUpdatedAgo } from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

type DashboardPost = CalendarPost & { brandName?: string };

type DashboardClientViewProps = {
  stats: {
    scheduled: number;
    pending: number;
    published: number;
  };
  publishedByBrand: Record<string, PublishedBrandStats>;
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
  publishedByBrand,
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
  const clientPublished = useMemo(() => {
    if (!activeClient.id) return stats.published;
    return publishedByBrand[activeClient.id]?.total ?? 0;
  }, [activeClient.id, publishedByBrand, stats.published]);
  const clientPublishedThisWeek = useMemo(() => {
    if (!activeClient.id) return analytics.publishedThisWeek;
    return publishedByBrand[activeClient.id]?.thisWeek ?? 0;
  }, [activeClient.id, publishedByBrand, analytics.publishedThisWeek]);
  const [platformFilter, setPlatformFilter] = useState("all");

  const platforms = useMemo(
    () => Array.from(new Set(clientScheduled.map((post) => post.platform.toLowerCase()))),
    [clientScheduled],
  );

  const filteredScheduled = useMemo(
    () =>
      platformFilter === "all"
        ? clientScheduled
        : clientScheduled.filter((post) => post.platform.toLowerCase() === platformFilter),
    [clientScheduled, platformFilter],
  );

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
      done:
        clientPending.length === 0 &&
        (clientScheduled.length > 0 || clientPublished > 0),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
      <ActiveClientBanner />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-playfair text-3xl italic text-near-black">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-label">
            {activeClient.name} — your autopilot command center
          </p>
        </div>
        <TextureButton asChild variant="primary" size="default" className="shrink-0">
          <Link href={activeClient.id ? `/brands/${activeClient.id}` : "/brands"}>
            Generate posts →
          </Link>
        </TextureButton>
      </div>

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
            value={clientPublished}
            hint={`${clientPublishedThisWeek} this week · For ${activeClient.name}`}
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
              description="Ready to generate your next batch of posts?"
              action={
                <div className="flex gap-3">
                  <TextureButton asChild variant="primary" size="default">
                    <Link href="/brands">Generate more posts</Link>
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
              {platforms.length > 1 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {["all", ...platforms].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setPlatformFilter(platform)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        platformFilter === platform
                          ? "border-gold bg-gold text-white"
                          : "border-black/10 bg-cream text-gray-label hover:border-gold/50",
                      )}
                    >
                      {platform === "all"
                        ? "All"
                        : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              ) : null}

              {filteredScheduled.map((post) => (
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
