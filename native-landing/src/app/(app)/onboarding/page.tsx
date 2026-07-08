import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { AppHeader } from "@/components/app/app-header";
import { OnboardingHeroBootstrap } from "@/components/app/onboarding-hero-bootstrap";
import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { getOrCreateUser } from "@/lib/db";
import { getAppContext } from "@/lib/server/app-data";
import { websiteHostname } from "@/lib/website-url";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { url?: string; brand?: string; add?: string };
}) {
  const addingAnother = searchParams.add === "1" && !searchParams.url;
  const { userId, websiteUrl, brands } = await getAppContext(searchParams.url);
  const [clerkUser, dbUser] = await Promise.all([
    currentUser(),
    getOrCreateUser(userId),
  ]);

  const skipWelcome =
    addingAnother || dbUser.profileOnboardingCompleted || brands.length > 0;

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
        title={addingAnother ? "Add another brand" : "Welcome to Kerygma Social"}
        description={
          addingAnother
            ? "Enter a new website and we will crawl it, confirm your brand voice, and draft posts."
            : "We'll learn your business, confirm your brand voice, then draft your first posts."
        }
      />
      <div className="flex flex-1 justify-center overflow-y-auto px-6 pb-10 pt-8">
        <OnboardingFlow
          websiteUrl={addingAnother ? null : websiteUrl}
          brandName={brandName}
          addingAnother={addingAnother}
          skipWelcome={skipWelcome}
          initialName={clerkUser?.fullName ?? dbUser.displayName}
          initialEmail={clerkUser?.emailAddresses[0]?.emailAddress ?? dbUser.email}
        />
      </div>
    </>
  );
}
