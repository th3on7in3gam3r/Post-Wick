import { NextResponse } from "next/server";
import { isMetaConfigured, metaRedirectUri } from "@/lib/social/meta";
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
    instagramScopes: [
      "instagram_basic",
      "instagram_content_publish",
      "pages_show_list",
      "pages_read_engagement",
    ],
    instructions: [
      "Create an app at developers.facebook.com and add products: Facebook Login + Instagram.",
      `Facebook Login → Settings → Valid OAuth Redirect URIs — add EXACTLY: ${redirectUri}`,
      "Instagram → API setup with Facebook Login — complete business verification if prompted.",
      "Your Instagram account must be Business or Creator and linked to a Facebook Page.",
      "In Meta Business Suite: link the Page to your Instagram profile before connecting.",
      "Add META_APP_ID and META_APP_SECRET to Vercel env vars, redeploy, then connect from Settings → Integrations → Instagram.",
      "Instagram posts require an image — use Add images on your brand page or refine with a new image.",
    ],
  });
}
