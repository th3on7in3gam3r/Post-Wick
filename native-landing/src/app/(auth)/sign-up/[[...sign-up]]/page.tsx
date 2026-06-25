import { SignUp } from "@clerk/nextjs";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { onboardingRedirectFromHeroUrl } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { url?: string; redirect_url?: string };
}) {
  const pendingUrl = searchParams.url
    ? normalizeWebsiteUrl(searchParams.url)
    : null;
  const redirectUrl =
    searchParams.redirect_url ??
    (pendingUrl ? onboardingRedirectFromHeroUrl(pendingUrl) : "/onboarding");
  const signInUrl = pendingUrl
    ? `/sign-in?url=${encodeURIComponent(pendingUrl)}&redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-in";

  return (
    <SignUp
      appearance={clerkAppearanceAuth}
      routing="path"
      path="/sign-up"
      signInUrl={signInUrl}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
