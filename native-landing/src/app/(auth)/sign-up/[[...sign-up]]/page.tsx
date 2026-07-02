import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { AgencyReferralCapture } from "@/components/agency/agency-referral-capture";
import { AuthClerkSlot } from "@/components/auth-clerk-slot";
import { authRedirectPath, pairedAuthUrls } from "@/lib/auth-routes";
import { siteUrl } from "@/lib/brand";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { onboardingRedirectFromHeroUrl } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: `${siteUrl()}/sign-up`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { url?: string; redirect_url?: string; ref?: string };
}) {
  const pendingUrl = searchParams.url
    ? normalizeWebsiteUrl(searchParams.url)
    : null;
  const redirectUrl = authRedirectPath(
    searchParams.redirect_url ??
      (pendingUrl ? onboardingRedirectFromHeroUrl(pendingUrl) : undefined),
  );
  const { signInUrl } = pairedAuthUrls({ redirectUrl, pendingUrl });

  return (
    <AuthClerkSlot>
      <Suspense fallback={null}>
        <AgencyReferralCapture />
      </Suspense>
      <SignUp
        appearance={clerkAppearanceAuth}
        routing="path"
        path="/sign-up"
        signInUrl={signInUrl}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </AuthClerkSlot>
  );
}
