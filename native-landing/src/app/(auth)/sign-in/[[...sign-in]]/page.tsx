import { SignIn } from "@clerk/nextjs";
import { AuthClerkSlot } from "@/components/auth-clerk-slot";
import { authRedirectPath, pairedAuthUrls } from "@/lib/auth-routes";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { onboardingRedirectFromHeroUrl } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { url?: string; redirect_url?: string };
}) {
  const pendingUrl = searchParams.url
    ? normalizeWebsiteUrl(searchParams.url)
    : null;
  const redirectUrl = authRedirectPath(
    searchParams.redirect_url ??
      (pendingUrl ? onboardingRedirectFromHeroUrl(pendingUrl) : undefined),
  );
  const { signUpUrl } = pairedAuthUrls({ redirectUrl, pendingUrl });

  return (
    <AuthClerkSlot>
      <SignIn
        appearance={clerkAppearanceAuth}
        routing="path"
        path="/sign-in"
        signUpUrl={signUpUrl}
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </AuthClerkSlot>
  );
}
