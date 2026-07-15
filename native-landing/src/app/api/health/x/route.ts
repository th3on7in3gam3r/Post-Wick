import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/brand";
import {
  isXConfigured,
  xClientId,
  xOAuthIncludeMediaWrite,
  xOAuthScopes,
  xRedirectUri,
} from "@/lib/social/x";

export async function GET() {
  const redirectUri = xRedirectUri();
  const appUrl = siteUrl();
  const includeMediaWrite = xOAuthIncludeMediaWrite();

  return NextResponse.json({
    ok: isXConfigured(),
    clientIdConfigured: Boolean(xClientId()),
    secretConfigured: Boolean(
      process.env.X_CLIENT_SECRET?.trim() || process.env.TWITTER_CLIENT_SECRET?.trim(),
    ),
    appUrl,
    redirectUri,
    includeMediaWrite,
    scopes: xOAuthScopes(),
    instructions: [
      "In the X Developer Portal → your app → User authentication settings → Set up.",
      "Enable OAuth 2.0, type: Web App, App permissions: Read and write.",
      "Put the app inside a Project (standalone apps often fail OAuth 2.0).",
      `Callback URI / Redirect URL — add EXACTLY: ${redirectUri}`,
      "Website URL: your production domain (e.g. https://kerygmasocial.com).",
      "If the app is in Development mode, the approving X account must be a team member.",
      "Copy OAuth 2.0 Client ID and Client Secret into X_CLIENT_ID and X_CLIENT_SECRET.",
      includeMediaWrite
        ? "media.write is enabled via X_OAUTH_INCLUDE_MEDIA_WRITE — reconnect X after changing this."
        : "Default Connect scopes omit media.write (text posts only). Set X_OAUTH_INCLUDE_MEDIA_WRITE=1 for images, then reconnect X.",
      "Redeploy, then Connect X from Settings → Integrations.",
    ],
  });
}
