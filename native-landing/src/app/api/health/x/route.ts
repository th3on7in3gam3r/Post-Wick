import { NextResponse } from "next/server";
import { isXConfigured, xClientId, xRedirectUri } from "@/lib/social/x";
import { siteUrl } from "@/lib/brand";

export async function GET() {
  const redirectUri = xRedirectUri();
  const appUrl = siteUrl();

  return NextResponse.json({
    ok: isXConfigured(),
    clientIdConfigured: Boolean(xClientId()),
    secretConfigured: Boolean(
      process.env.X_CLIENT_SECRET?.trim() || process.env.TWITTER_CLIENT_SECRET?.trim(),
    ),
    appUrl,
    redirectUri,
    scopes: [
      "tweet.read",
      "tweet.write",
      "users.read",
      "offline.access",
      "media.write",
    ],
    instructions: [
      "In the X Developer Portal → your app → User authentication settings → Set up.",
      "Enable OAuth 2.0, type: Web App, App permissions: Read and write.",
      `Callback URI / Redirect URL — add EXACTLY: ${redirectUri}`,
      "Website URL: your production domain (e.g. https://kerygmasocial.com).",
      "Copy OAuth 2.0 Client ID and Client Secret into X_CLIENT_ID and X_CLIENT_SECRET in Vercel.",
      "Redeploy, then Connect X from Settings → Integrations.",
    ],
  });
}
