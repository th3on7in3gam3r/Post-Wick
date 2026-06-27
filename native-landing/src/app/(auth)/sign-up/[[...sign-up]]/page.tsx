import { SignUp } from "@clerk/nextjs";
import { AuthClerkSlot } from "@/components/auth-clerk-slot";
import { authRedirectPath, pairedAuthUrls } from "@/lib/auth-routes";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { onboardingRedirectFromHeroUrl } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export const dynamic = "force-dynamic";

export default function SignUpPage({
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
  const { signInUrl } = pairedAuthUrls({ redirectUrl, pendingUrl });

  return (
    <AuthClerkSlot>
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
