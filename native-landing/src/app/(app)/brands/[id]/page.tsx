import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  ExternalLink,
  Link2,
  ListChecks,
  Globe,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { BrandSitePreview } from "@/components/app/brand-site-preview";
import { GeneratePostsButton } from "@/components/app/generate-posts-button";
import { PanelCard } from "@/components/app/panel-card";
import { StatCard } from "@/components/app/stat-card";
import { TextureButton } from "@/components/ui/texture-button";
import { resolveBrandAssets } from "@/lib/brand-assets";
import {
  getBrandById,
  getConnectionsByUserId,
  getPostsByBrandId,
  getOrCreateUser,
} from "@/lib/db";
import { getPlanLimits } from "@/lib/plans";
import { requireUserId } from "@/lib/server/app-data";
import { websiteHostname } from "@/lib/website-url";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function BrandPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await requireUserId();
  const brand = getBrandById(params.id, userId);
  if (!brand) notFound();

  const user = getOrCreateUser(userId);
  const plan = getPlanLimits(user.subscriptionTier);

  const posts = getPostsByBrandId(brand.id);
  const connections = getConnectionsByUserId(userId).filter(
    (connection) => connection.brandId === brand.id,
  );
  const research = brand.researchData ? JSON.parse(brand.researchData) : null;
  const crawledPages =
    (research?.crawledPages as Array<{ url: string; title: string }> | undefined) ?? [];
  const pendingCount = posts.filter((post) => post.status === "pending").length;
  const scheduledCount = posts.filter(
    (post) => post.scheduledAt && ["approved", "published"].includes(post.status),
  ).length;
  const scheduledPosts = posts
    .filter((post) => post.scheduledAt && ["approved", "published"].includes(post.status))
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  const assets = await resolveBrandAssets(brand.websiteUrl, research);

  return (
    <>
      <AppHeader
        title={brand.name}
        description={`${websiteHostname(brand.websiteUrl)} — brand profile and content`}
      />

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 md:px-8 md:py-8">
        <BrandSitePreview
          variant="identity"
          name={brand.name}
          websiteUrl={brand.websiteUrl}
          logoUrl={assets.logoUrl}
          siteImageUrl={assets.siteImageUrl}
        >
          <TextureButton asChild variant="minimal" size="sm">
            <a href={brand.websiteUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Visit
            </a>
          </TextureButton>
          <TextureButton asChild variant="minimal" size="sm">
            <Link href="/calendar">
              <Calendar className="mr-1.5 h-3.5 w-3.5" />
              Calendar
            </Link>
          </TextureButton>
          <TextureButton asChild variant="minimal" size="sm">
            <Link href="/settings/connections">
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Connect
            </Link>
          </TextureButton>
        </BrandSitePreview>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Crawl status"
            value={brand.crawlStatus.charAt(0).toUpperCase() + brand.crawlStatus.slice(1)}
            icon={Globe}
          />
          <StatCard
            label="Draft posts"
            value={posts.length}
            hint="Generated for this brand"
            icon={Sparkles}
          />
          <StatCard
            label="Awaiting approval"
            value={pendingCount}
            hint="In your review queue"
            icon={ListChecks}
          />
          <StatCard
            label="Scheduled"
            value={scheduledCount}
            hint="Approved and on the calendar"
            icon={CalendarDays}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <PanelCard
            title="Brand profile"
            description="Built from your website crawl."
            action={
              <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                <GeneratePostsButton brandId={brand.id} generateMax={plan.generateMax} />
                <TextureButton asChild variant="minimal" size="sm">
                  <Link href="/queue">Open queue</Link>
                </TextureButton>
              </div>
            }
          >
            {research ? (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                {research.source ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                      Research source
                    </dt>
                    <dd className="mt-1 text-gray-body">{String(research.source)}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                    Industry
                  </dt>
                  <dd className="mt-1 text-gray-body">{research.industry}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                    Tone
                  </dt>
                  <dd className="mt-1 text-gray-body">{research.tone}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                    Value proposition
                  </dt>
                  <dd className="mt-1 text-gray-body">{research.uniqueValueProposition}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                    Key topics
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {(research.keyTopics as string[]).map((topic: string) => (
                      <span
                        key={topic}
                        className="rounded-full border border-black/[0.06] bg-cream/70 px-3 py-1 text-xs text-near-black"
                      >
                        {topic}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-gray-body">No research data yet.</p>
            )}
          </PanelCard>

          <div className="space-y-6">
            <PanelCard title="Connections" description="Channels linked to this brand.">
              {connections.length > 0 ? (
                <ul className="space-y-2">
                  {connections.map((connection) => (
                    <li
                      key={connection.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-cream/50 px-3 py-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium capitalize text-near-black">
                          {connection.platform}
                        </p>
                        <p className="truncate text-xs text-gray-body">
                          {connection.accountName || "Connected account"}
                          {connection.isDemo ? " · Demo" : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        Active
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-3 text-sm text-gray-body">
                  <p>No channels connected yet.</p>
                  <TextureButton asChild variant="minimal" size="sm">
                    <Link href="/settings/connections">Connect LinkedIn</Link>
                  </TextureButton>
                </div>
              )}
            </PanelCard>

            <PanelCard
              title="Crawled pages"
              description={`${crawledPages.length || research?.pageCount || 0} pages indexed.`}
            >
              {crawledPages.length > 0 ? (
                <ul className="max-h-52 space-y-1 overflow-y-auto pr-1">
                  {crawledPages.map((page) => (
                    <li key={page.url}>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-cream/60"
                      >
                        <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-near-black group-hover:text-gold">
                            {page.title || page.url}
                          </span>
                          <span className="block truncate text-xs text-gray-body">
                            {page.url}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-body">No crawl page list saved yet.</p>
              )}
            </PanelCard>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PanelCard title="Recent drafts" description="Latest generated posts.">
            {posts.length > 0 ? (
              <div className="space-y-2">
                {posts.slice(0, 4).map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-black/[0.06] bg-cream/50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                        {post.platform}
                      </p>
                      <p className="text-[11px] capitalize text-gray-label">{post.status}</p>
                    </div>
                    {post.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="mt-2 aspect-video w-full rounded-lg border border-black/[0.06] object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                    <p className="mt-1.5 line-clamp-2 text-sm text-near-black">{post.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-gray-body">
                <ListChecks className="h-4 w-4 text-gold" />
                No posts yet.
              </div>
            )}
          </PanelCard>

          <PanelCard title="Scheduled posts" description="Approved posts waiting to publish.">
            {scheduledPosts.length > 0 ? (
              <div className="space-y-2">
                {scheduledPosts.slice(0, 4).map((post) => (
                  <article
                    key={post.id}
                    className="rounded-xl border border-black/[0.06] bg-cream/50 p-3.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
                        {post.platform}
                      </p>
                      <p className="text-[11px] text-gray-label">
                        {formatDate(post.scheduledAt!)}
                      </p>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm text-near-black">{post.content}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-body">
                <p>Approve drafts in the queue to schedule them on the calendar.</p>
                <TextureButton asChild variant="minimal" size="sm">
                  <Link href="/queue">Review queue</Link>
                </TextureButton>
              </div>
            )}
          </PanelCard>
        </div>
      </div>
    </>
  );
}
