import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { TextureButton } from "@/components/ui/texture-button";
import { siteUrl } from "@/lib/brand";
import { getPublicBrandBySlug } from "@/lib/db";
import { toPublicBrandListing } from "@/lib/directory/public-brands";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = {
  params: { slug: string };
};

export async function generateMetadata({ params }: PageProps) {
  const brand = await getPublicBrandBySlug(params.slug);
  if (!brand) {
    return createPageMetadata({ title: "Business not found", path: `/directory/${params.slug}` });
  }

  const listing = toPublicBrandListing(brand);
  return createPageMetadata({
    title: `${listing.name} | Directory`,
    description:
      listing.description ??
      `${listing.name} uses Kerygma Social for consistent, on-brand social media.`,
    path: `/directory/${params.slug}`,
  });
}

export default async function PublicBrandDirectoryPage({ params }: PageProps) {
  const brand = await getPublicBrandBySlug(params.slug);
  if (!brand) notFound();

  const listing = toPublicBrandListing(brand);
  const profileUrl = `${siteUrl()}/directory/${params.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: listing.name,
    url: listing.websiteUrl,
    description: listing.description ?? undefined,
    sameAs: [listing.websiteUrl, profileUrl],
  };

  return (
    <MarketingShell wide heroBackground>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="mx-auto max-w-[720px] rounded-3xl border border-black/[0.06] bg-white p-8 shadow-card md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
          {listing.niche}
        </p>
        <h1 className="mt-3 font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
          {listing.name}
        </h1>
        {listing.description ? (
          <p className="body-copy mt-4 text-[1.05rem]">{listing.description}</p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TextureButton asChild variant="secondary" size="lg">
            <a href={listing.websiteUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit website
            </a>
          </TextureButton>
          <TextureButton asChild variant="primary" size="lg">
            <Link href="/get-started?ref=directory">Start with Kerygma Social</Link>
          </TextureButton>
        </div>
        <p className="mt-8 text-center text-xs text-gray-label">
          <Link href="/directory" className="hover:text-near-black hover:underline">
            ← Back to directory
          </Link>
        </p>
      </article>
    </MarketingShell>
  );
}
