import { DirectoryClient } from "@/components/directory/directory-client";
import { MarketingShell } from "@/components/marketing-shell";
import { getPublicDirectoryBrands } from "@/lib/db";
import { getPublicBrandListings } from "@/lib/directory/public-brands";
import { siteUrl } from "@/lib/brand";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Browse local and faith-based businesses using Kerygma Social for consistent, on-brand social media.";

export const metadata = createPageMetadata({
  title: "Business Directory",
  description,
  ogTitle: "Kerygma Social Business Directory | Optimized social feeds",
  ogDescription: description,
  path: "/directory",
});

function directoryJsonLd(listingCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kerygma Social Business Directory",
    description,
    url: `${siteUrl()}/directory`,
    numberOfItems: listingCount,
  };
}

export default async function DirectoryPage() {
  const brands = await getPublicDirectoryBrands();
  const listings = getPublicBrandListings(brands);

  return (
    <MarketingShell wide>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directoryJsonLd(listings.length)) }}
      />
      <DirectoryClient listings={listings} />
    </MarketingShell>
  );
}
