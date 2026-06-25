import { NextResponse } from "next/server";
import {
  instagramAppCredentials,
  instagramOAuthScopes,
  isInstagramConfigured,
  metaRedirectUri,
} from "@/lib/social/meta";
import { siteUrl } from "@/lib/brand";

export async function GET() {
  const redirectUri = metaRedirectUri();
  const { appId } = instagramAppCredentials();
  const appUrl = siteUrl();

  return NextResponse.json({
    ok: isInstagramConfigured(),
    appIdConfigured: Boolean(appId),
    secretConfigured: Boolean(instagramAppCredentials().appSecret),
    usesInstagramAppId: Boolean(process.env.INSTAGRAM_APP_ID?.trim()),
    appUrl,
    redirectUri,
    instagramOAuth: "instagram_login",
    instagramScopes: instagramOAuthScopes(),
    instructions: [
      "In Meta: Use cases → Manage messaging & content on Instagram → API setup with Instagram login.",
      "Open step 3 (Set up Instagram business login) → Business login settings → OAuth redirect URIs.",
      `Add EXACTLY: ${redirectUri}`,
      "Copy the Instagram App ID + Instagram App Secret from that Instagram login setup page (NOT App settings → Basic).",
      "Set them in Vercel as INSTAGRAM_APP_ID + INSTAGRAM_APP_SECRET, or META_APP_ID + META_APP_SECRET.",
      "App settings → Basic → App domains: post-wick.vercel.app",
      "Redeploy Vercel, then Connect Instagram in Post-Wick.",
    ],
  });
}
