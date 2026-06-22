import { SignUp } from "@clerk/nextjs";
import { clerkAppearanceAuth } from "@/lib/clerk-appearance";
import { normalizeWebsiteUrl } from "@/lib/website-url";

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { url?: string };
}) {
  const pendingUrl = searchParams.url
    ? normalizeWebsiteUrl(searchParams.url)
    : null;
  const redirectUrl = pendingUrl
    ? `/onboarding?url=${encodeURIComponent(pendingUrl)}`
    : "/onboarding";

  return (
    <SignUp
      appearance={clerkAppearanceAuth}
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl={redirectUrl}
      fallbackRedirectUrl={redirectUrl}
    />
  );
}
