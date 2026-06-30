import { NextResponse } from "next/server";
import { siteUrl } from "@/lib/brand";
import { getIntegrationProvidersSummary } from "@/lib/integrations/config";

export async function GET() {
  const providers = getIntegrationProvidersSummary();
  const encryptionKeySet = Boolean(process.env.ENCRYPTION_KEY?.trim());
  const allProvidersConfigured = Object.values(providers).every(Boolean);

  return NextResponse.json({
    ok: encryptionKeySet && allProvidersConfigured,
    appUrl: siteUrl(),
    encryptionKeySet,
    providers,
    reconnectRequired:
      "If integrations broke after an env var change, disconnect each channel and connect again. Never change ENCRYPTION_KEY on production without reconnecting all channels.",
    oauthRedirectUris: {
      linkedin: `${siteUrl()}/api/social/linkedin/callback`,
      meta: `${siteUrl()}/api/social/meta/callback`,
      x: `${siteUrl()}/api/social/x/callback`,
      pinterest: `${siteUrl()}/api/social/pinterest/callback`,
    },
  });
}
