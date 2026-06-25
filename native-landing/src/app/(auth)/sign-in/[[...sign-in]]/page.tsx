import { SignIn } from "@clerk/nextjs";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { onboardingRedirectFromHeroUrl } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export default function SignInPage({
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
  const signUpUrl = pendingUrl
    ? `/sign-up?url=${encodeURIComponent(pendingUrl)}&redirect_url=${encodeURIComponent(redirectUrl)}`
    : "/sign-up";

  return (
    <SignIn
      appearance={clerkAppearanceAuth}
      routing="path"
      path="/sign-in"
      signUpUrl={signUpUrl}
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
