import { AppHeader } from "@/components/app/app-header";
import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { getAppContext } from "@/lib/server/app-data";
import { websiteHostname } from "@/lib/website-url";
import { redirect } from "next/navigation";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { url?: string; brand?: string; add?: string };
}) {
  const addingAnother = searchParams.add === "1";
  const { websiteUrl, brands } = await getAppContext(searchParams.url);

  if (
    brands.some((brand) => brand.crawlStatus === "completed") &&
    !searchParams.url &&
    !addingAnother
  ) {
    redirect("/dashboard");
  }

  const brandName = websiteUrl ? websiteHostname(websiteUrl) : null;

  return (
    <>
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
