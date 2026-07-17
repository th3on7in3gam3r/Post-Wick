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
import { BrandDirectoryToggle } from "@/components/app/brand-directory-toggle";
import { BrandImageStylePicker } from "@/components/app/brand-image-style-picker";
import { BrandProfileCard } from "@/components/app/brand-profile-card";
import { BrandSitePreview } from "@/components/app/brand-site-preview";
import { GenerateImagesButton } from "@/components/app/generate-images-button";
import { PanelCard } from "@/components/app/panel-card";
import { PostPreviewRow } from "@/components/app/post-preview-row";
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
import { postNeedsImageGeneration } from "@/lib/posts/image-url";
import { parseImageStylePreset } from "@/lib/ai/image-style-presets";
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
  const brand = await getBrandById(params.id, userId);
  if (!brand) notFound();

  const user = await getOrCreateUser(userId);
  const plan = getPlanLimits(user.subscriptionTier);

  const posts = await getPostsByBrandId(brand.id);
  const connections = (await getConnectionsByUserId(userId)).filter(
    (connection) => connection.brandId === brand.id,
  );
  const research = brand.researchData ? JSON.parse(brand.researchData) : null;
  const crawledPages =
    (research?.crawledPages as Array<{ url: string; title: string }> | undefined) ?? [];
  const pendingCount = posts.filter((post) => post.status === "pending").length;
  const scheduledCount = posts.filter(
    (post) => post.scheduledAt && ["approved", "published"].includes(post.status),
  ).length;
  const recentDrafts = posts
    .filter((post) => post.status === "pending")
    .slice(0, 12);
  const scheduledPosts = posts
    .filter((post) => post.scheduledAt && ["approved", "published"].includes(post.status))
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  const missingImageCount = posts.filter((post) =>
    postNeedsImageGeneration(post.imageUrl),
  ).length;
  const assets = await resolveBrandAssets(brand.websiteUrl, research);
  const industry = research?.industry?.trim() || "Business";
  const imageStylePreset = parseImageStylePreset(research?.imageStylePreset);

  return (
    <>
      <AppHeader
        title={brand.name}
        description={`${websiteHostname(brand.websiteUrl)} — brand profile and content`}
      />

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <BrandSitePreview
          variant="identity"
          name={brand.name}
          websiteUrl={brand.websiteUrl}
          logoUrl={assets.logoUrl}
          siteImageUrl={assets.siteImageUrl}
          brandId={brand.id}
          industry={industry}
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
            <Link href="/settings/integrations">
              <Link2 className="mr-1.5 h-3.5 w-3.5" />
              Connect
            </Link>
          </TextureButton>
        </BrandSitePreview>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Crawl status"
            value={brand.crawlStatus.charAt(0).toUpperCase() + brand.crawlStatus.slice(1)}
            valueVariant="compact"
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

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <BrandProfileCard
            brandId={brand.id}
            generateMax={plan.generateMax}
            connectedPlatforms={connections.map((connection) => connection.platform)}
            research={research}
          />

          <div className="space-y-6">
            <PanelCard
              title="Image style"
              description="Choose how AI-generated post images look for this brand."
            >
              <BrandImageStylePicker
                brandId={brand.id}
                initialPreset={imageStylePreset}
                postCount={posts.length}
              />
            </PanelCard>

            {brand.crawlStatus === "completed" ? (
              <PanelCard
                title="Directory listing"
                description="Share your brand on the public Kerygma Social directory. Connect Postwick from Settings → Integrations."
              >
                <BrandDirectoryToggle
                  brandId={brand.id}
                  initialIsPublic={brand.isPublic}
                  publicSlug={brand.publicSlug}
                  publicNiche={brand.publicNiche}
                />
              </PanelCard>
            ) : null}

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
                    <Link href="/settings/integrations">Connect channels</Link>
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

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <PanelCard
            title="Recent drafts"
            description="Latest generated posts."
            action={
              <GenerateImagesButton
                brandId={brand.id}
                missingCount={missingImageCount}
              />
            }
          >
            {recentDrafts.length > 0 ? (
              <div className="max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {recentDrafts.map((post) => (
                  <PostPreviewRow
                    key={post.id}
                    platform={post.platform}
                    meta={post.status}
                    content={post.content}
                    imageUrl={post.imageUrl}
                  />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="flex min-h-32 flex-col justify-center space-y-3 text-sm text-gray-body">
                <p>All drafts are approved — see scheduled posts.</p>
                <TextureButton asChild variant="minimal" size="sm">
                  <Link href="/queue">Open queue</Link>
                </TextureButton>
              </div>
            ) : (
              <div className="flex min-h-32 items-center gap-3 text-sm text-gray-body">
                <ListChecks className="h-4 w-4 text-gold" />
                No posts yet.
              </div>
            )}
          </PanelCard>

          <PanelCard title="Scheduled posts" description="Approved posts waiting to publish.">
            {scheduledPosts.length > 0 ? (
              <div className="relative z-0 max-h-80 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {scheduledPosts.map((post) => (
                  <PostPreviewRow
                    key={post.id}
                    platform={post.platform}
                    meta={formatDate(post.scheduledAt!)}
                    content={post.content}
                    imageUrl={post.imageUrl}
                  />
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
