import { NextResponse } from "next/server";
import {
  instagramOAuthScopes,
  isMetaConfigured,
  metaRedirectUri,
} from "@/lib/social/meta";
import { siteUrl } from "@/lib/brand";

export async function GET() {
  const redirectUri = metaRedirectUri();
  const appId = process.env.META_APP_ID?.trim() ?? null;
  const appUrl = siteUrl();

  return NextResponse.json({
    ok: isMetaConfigured(),
    appIdConfigured: Boolean(appId),
    secretConfigured: Boolean(process.env.META_APP_SECRET?.trim()),
    appUrl,
    redirectUri,
    instagramOAuth: "instagram_login",
    instagramScopes: instagramOAuthScopes(),
    instructions: [
      "Create a Meta app with use case: Manage messaging & content on Instagram.",
      `Instagram → API setup with Instagram login → OAuth redirect URIs — add EXACTLY: ${redirectUri}`,
      "Use App ID + App Secret from App settings → Basic as META_APP_ID and META_APP_SECRET on Vercel.",
      "Your Instagram account must be Business or Creator.",
      "Redeploy Vercel after updating env vars, then connect from Settings → Integrations → Instagram.",
      "Instagram posts require an image — use Add images on your brand page or refine with a new image.",
    ],
  });
}
