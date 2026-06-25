import Link from "next/link";
import { Building2 } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { BrandList } from "@/components/app/brand-list";
import { EmptyState } from "@/components/app/empty-state";
import { TextureButton } from "@/components/ui/texture-button";
import { resolveBrandAssets } from "@/lib/brand-assets";
import { getAppContext } from "@/lib/server/app-data";

export default async function BrandsPage() {
  const { brands } = await getAppContext();

  const brandsWithAssets = await Promise.all(
    brands.map(async (brand) => {
      const research = brand.researchData ? JSON.parse(brand.researchData) : null;
      const assets = await resolveBrandAssets(brand.websiteUrl, research);
      return {
        id: brand.id,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        crawlStatus: brand.crawlStatus,
        logoUrl: assets.logoUrl,
        siteImageUrl: assets.siteImageUrl,
      };
    }),
  );

  return (
    <>
      <AppHeader
        title="Brands"
        description="Manage the businesses running on autopilot."
      />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        {brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No brands yet"
            description="Add your website and Kerygma Social will crawl it, build a profile, and draft your first posts."
            action={
              <TextureButton asChild variant="primary" size="default">
                <Link href="/onboarding">Set up your brand</Link>
              </TextureButton>
            }
          />
        ) : (
          <BrandList brands={brandsWithAssets} />
        )}

        {brands.length > 0 ? (
          <div className="flex justify-center">
            <TextureButton asChild variant="secondary" size="default">
              <Link href="/onboarding?add=1">Add another brand</Link>
            </TextureButton>
          </div>
        ) : null}
      </div>
    </>
  );
}
