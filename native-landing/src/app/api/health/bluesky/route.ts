import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/brand";
import {
  blueskyClientMetadataUrl,
  blueskyRedirectUri,
  isBlueskyConfigured,
  isBlueskyConfidentialClient,
  isBlueskyLoopbackMode,
} from "@/lib/social/bluesky";

export async function GET() {
  return NextResponse.json({
    ok: isBlueskyConfigured(),
    loopbackMode: isBlueskyLoopbackMode(),
    confidentialClient: isBlueskyConfidentialClient(),
    privateJwkConfigured: Boolean(process.env.BLUESKY_OAUTH_PRIVATE_JWK?.trim()),
    appUrl: siteUrl(),
    clientMetadataUrl: blueskyClientMetadataUrl(),
    redirectUri: blueskyRedirectUri(),
    scopes: ["atproto", "transition:generic"],
    instructions: [
      "Bluesky uses AT Protocol OAuth (free). No developer billing.",
      "Local testing: run the app on http://127.0.0.1:<port> (not localhost).",
      "Production: set NEXT_PUBLIC_APP_URL to your https domain. Live connect works as a public client without a private key.",
      "Optional stronger auth: set BLUESKY_OAUTH_PRIVATE_JWK (npm run gen:bluesky-jwk) for a confidential client.",
      `Client metadata: ${blueskyClientMetadataUrl()}`,
      `Redirect URI: ${blueskyRedirectUri()}`,
    ],
  });
}
