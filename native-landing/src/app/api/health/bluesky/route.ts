import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/brand";
import {
  blueskyClientMetadataUrl,
  blueskyRedirectUri,
  isBlueskyConfigured,
  isBlueskyLoopbackMode,
} from "@/lib/social/bluesky";

export async function GET() {
  return NextResponse.json({
    ok: isBlueskyConfigured(),
    loopbackMode: isBlueskyLoopbackMode(),
    privateJwkConfigured: Boolean(process.env.BLUESKY_OAUTH_PRIVATE_JWK?.trim()),
    appUrl: siteUrl(),
    clientMetadataUrl: blueskyClientMetadataUrl(),
    redirectUri: blueskyRedirectUri(),
    scopes: ["atproto", "transition:generic"],
    instructions: [
      "Bluesky uses AT Protocol OAuth (free). No developer billing.",
      "Local testing: run the app on http://127.0.0.1:<port> (not localhost).",
      "Production: set NEXT_PUBLIC_APP_URL to your https domain and BLUESKY_OAUTH_PRIVATE_JWK (ES256).",
      "Generate a key with: node scripts/gen-bluesky-jwk.mjs",
      `Client metadata: ${blueskyClientMetadataUrl()}`,
      `Redirect URI: ${blueskyRedirectUri()}`,
    ],
  });
}
