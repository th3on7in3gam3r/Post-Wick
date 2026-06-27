export const SETTINGS_BILLING_PATH = "/settings/billing";

export function authRedirectPath(redirectUrl?: string | null) {
  return redirectUrl?.trim() || "/onboarding";
}

export function signUpHref(redirectPath = "/onboarding") {
  return `/sign-up?redirect_url=${encodeURIComponent(redirectPath)}`;
}

export function signInHref(options?: { redirectPath?: string; websiteUrl?: string | null }) {
  const params = new URLSearchParams();
  if (options?.websiteUrl) {
    params.set("url", options.websiteUrl);
  }
  if (options?.redirectPath) {
    params.set("redirect_url", options.redirectPath);
  }
  const query = params.toString();
  return query ? `/sign-in?${query}` : "/sign-in";
}

/** Pricing CTAs send new users to billing after sign-up. */
export const PRICING_SIGN_UP_HREF = signUpHref(SETTINGS_BILLING_PATH);

export function pairedAuthUrls(options: {
  redirectUrl: string;
  pendingUrl?: string | null;
}) {
  const { redirectUrl, pendingUrl = null } = options;
  return {
    signInUrl: signInHref({ redirectPath: redirectUrl, websiteUrl: pendingUrl }),
    signUpUrl: signUpHref(redirectUrl),
  };
}
