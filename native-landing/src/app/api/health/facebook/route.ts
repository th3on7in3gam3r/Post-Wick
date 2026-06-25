import { NextResponse } from "next/server";
import {
  facebookAppCredentials,
  facebookLoginConfigId,
  facebookOAuthScopes,
  isFacebookConfigured,
  metaRedirectUri,
} from "@/lib/social/meta";
import { siteUrl } from "@/lib/brand";

export async function GET() {
  const { appId, appSecret } = facebookAppCredentials();
  const configId = facebookLoginConfigId();
  const redirectUri = metaRedirectUri();
  const appUrl = siteUrl();

  const warnings: string[] = [];
  if (appId && appSecret && !configId) {
    warnings.push(
      "META_FB_LOGIN_CONFIG_ID is missing. Facebook Login for Business apps require a configuration ID from Meta → Facebook Login for Business → Configurations.",
    );
  }

  return NextResponse.json({
    ok: isFacebookConfigured(),
    appIdConfigured: Boolean(appId),
    secretConfigured: Boolean(appSecret),
    configIdConfigured: Boolean(configId),
    appUrl,
    redirectUri,
    facebookOAuth: "facebook_login_for_business",
    facebookScopes: facebookOAuthScopes(),
    warnings,
    instructions: [
      "In Meta: Facebook Login for Business → Configurations → Create configuration.",
      "Token type: User access token.",
      "Add permissions: pages_show_list, pages_manage_posts, pages_read_engagement.",
      "Copy the configuration ID into META_FB_LOGIN_CONFIG_ID (Vercel + .env.local).",
      "Facebook Login for Business → Settings → Valid OAuth Redirect URIs:",
      redirectUri,
      "Set META_APP_ID and META_APP_SECRET from App settings → Basic.",
      "Redeploy, then Connect Facebook in Post-Wick.",
    ],
  });
}
