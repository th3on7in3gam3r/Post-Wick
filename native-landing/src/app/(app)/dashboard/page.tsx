import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Globe,
  ListChecks,
  Send,
  Sparkles,
} from "lucide-react";
import { ActivityFeed, ActivityFeedFooter } from "@/components/app/activity-feed";
import { AppHeader } from "@/components/app/app-header";
import { EmptyState } from "@/components/app/empty-state";
import { PanelCard } from "@/components/app/panel-card";
import { StatCard } from "@/components/app/stat-card";
import { TextureButton } from "@/components/ui/texture-button";
import { formatScheduleLabel } from "@/lib/scheduling/slots";
import { getAppContext } from "@/lib/server/app-data";
import { websiteHostname } from "@/lib/website-url";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { url?: string; brand?: string };
}) {
  const { websiteUrl, brands, stats, pendingPosts, scheduledPosts, recentActivity, analytics, hasConnections, primaryBrand, plan } =
    await getAppContext(searchParams.url);

  if (brands.length === 0) {
    const target = websiteUrl
      ? `/onboarding?url=${encodeURIComponent(websiteUrl)}`
      : "/onboarding";
    redirect(target);
  }

  const brand =
    (searchParams.brand
      ? brands.find((item) => item.id === searchParams.brand)
      : null) ?? primaryBrand;

  const headerDescription = brand
    ? `${websiteHostname(brand.websiteUrl)} — your autopilot command center`
    : "Your autopilot command center";

  const setupSteps = [
    { label: "Add your brand website", done: brands.length > 0 },
    { label: "Connect social channels", done: hasConnections },
    { label: "Approve your first posts", done: stats.pending === 0 && stats.scheduled > 0 },
  ];

  return (
    <>
      <AppHeader title="Dashboard" description={headerDescription} />

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
        {brand ? (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/25 bg-white px-4 py-3 shadow-card">
            <div className="rounded-full bg-cream p-2">
              <Globe className="h-4 w-4 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-near-black">{brand.name}</p>
              <p className="truncate text-xs text-gray-body">{brand.websiteUrl}</p>
            </div>
            <Link
              href={`/brands/${brand.id}`}
              className="text-xs font-medium text-gold hover:opacity-80"
            >
              View brand
            </Link>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Scheduled"
            value={stats.scheduled}
            hint="Approved posts ready to publish"
            icon={CalendarDays}
          />
          <StatCard
            label="Awaiting approval"
            value={stats.pending}
            hint="Ready for your review"
            icon={ListChecks}
          />
          <StatCard
            label="Published"
            value={stats.published}
            hint={`${analytics.publishedThisWeek} this week`}
            icon={Send}
          />
          <StatCard
            label="Plan"
            value={plan.label}
            hint={`Up to ${plan.generateMax} posts per batch`}
            icon={Sparkles}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <PanelCard
            title="Needs your attention"
            description="Approve posts before they go live."
            action={
              <TextureButton asChild variant="minimal" size="sm">
                <Link href="/queue">Open queue</Link>
              </TextureButton>
            }
          >
            {pendingPosts.length > 0 ? (
              <div className="space-y-3">
                {pendingPosts.map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-black/[0.06] bg-cream/50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                      {post.platform}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-near-black">
                      {post.content}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ListChecks}
                title="No posts waiting"
                description="Generate more posts from your brand page or run onboarding again with a new URL."
                action={
                  brand ? (
                    <TextureButton asChild variant="primary" size="default">
                      <Link href={`/brands/${brand.id}`}>Open brand</Link>
                    </TextureButton>
                  ) : undefined
                }
              />
            )}
          </PanelCard>

          <PanelCard
            title="Upcoming week"
            description="A preview of what autopilot will publish."
            action={
              <TextureButton asChild variant="minimal" size="sm">
                <Link href="/calendar">Open calendar</Link>
              </TextureButton>
            }
          >
            {scheduledPosts.length > 0 ? (
              <div className="space-y-3">
                {scheduledPosts.map((post) => (
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
                description="Approve posts in your queue and they will appear here automatically."
              />
            )}
          </PanelCard>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <PanelCard
            title="Recent activity"
            description="What autopilot has done lately."
            action={
              <TextureButton asChild variant="minimal" size="sm">
                <Link href="/analytics">View analytics</Link>
              </TextureButton>
            }
          >
            <ActivityFeed items={recentActivity} />
            <ActivityFeedFooter />
          </PanelCard>

          <PanelCard
            title="Getting started"
            description="Three steps to your first autopilot post."
          >
            <ol className="space-y-3">
              {setupSteps.map((step) => (
                <li
                  key={step.label}
                  className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-cream/60 px-4 py-3 text-sm"
                >
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${step.done ? "text-gold" : "text-gray-label"}`}
                  />
                  <span className="text-near-black">{step.label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <TextureButton asChild variant="primary" size="default">
                <Link href="/queue">Review posts</Link>
              </TextureButton>
              <TextureButton asChild variant="secondary" size="default">
                <Link href="/settings/integrations">Connect channels</Link>
              </TextureButton>
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  );
}
