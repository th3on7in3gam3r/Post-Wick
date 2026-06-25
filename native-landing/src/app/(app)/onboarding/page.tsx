import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/app/app-header";
import { OnboardingHeroBootstrap } from "@/components/app/onboarding-hero-bootstrap";
import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { getAppContext } from "@/lib/server/app-data";
import { websiteHostname } from "@/lib/website-url";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { url?: string; brand?: string; add?: string };
}) {
  const addingAnother = searchParams.add === "1" && !searchParams.url;
  const { websiteUrl, brands } = await getAppContext(searchParams.url);

  if (
    brands.some((brand) => brand.crawlStatus === "completed") &&
    !searchParams.url &&
    !searchParams.add
  ) {
    redirect("/dashboard");
  }

  const brandName = websiteUrl ? websiteHostname(websiteUrl) : null;

  return (
    <>
      <Suspense fallback={null}>
        <OnboardingHeroBootstrap />
      </Suspense>
      <AppHeader
        title={addingAnother ? "Add another brand" : "Welcome to Post-Wick"}
        description={
          addingAnother
            ? "Enter a new website and we will crawl it, confirm your brand voice, and draft posts."
            : "We'll learn your business, confirm your brand voice, then draft your first posts."
        }
      />
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10">
        <OnboardingFlow
          websiteUrl={addingAnother ? null : websiteUrl}
          brandName={brandName}
          addingAnother={addingAnother}
        />
      </div>
    </>
  );
}
