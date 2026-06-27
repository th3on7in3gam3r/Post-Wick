import { NextResponse } from "next/server";
import { isPinterestConfigured, pinterestRedirectUri } from "@/lib/social/pinterest";
import { siteUrl } from "@/lib/brand";

export async function GET() {
  const redirectUri = pinterestRedirectUri();

  return NextResponse.json({
    ok: isPinterestConfigured(),
    appIdConfigured: Boolean(process.env.PINTEREST_APP_ID?.trim()),
    secretConfigured: Boolean(process.env.PINTEREST_APP_SECRET?.trim()),
    appUrl: siteUrl(),
    redirectUri,
    scopes: ["user_accounts:read", "boards:read", "pins:write"],
    instructions: [
      "Create an app at developers.pinterest.com and request Trial or Production access.",
      "Add this redirect URI under your app OAuth settings:",
      redirectUri,
      "Copy App ID → PINTEREST_APP_ID and App secret → PINTEREST_APP_SECRET.",
      "Pins require a public HTTPS image URL (use Fix images on the brand page).",
      "Connect from Settings → Integrations → Connect Pinterest.",
    ],
  });
}
