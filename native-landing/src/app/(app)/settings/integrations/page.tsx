import { Plug } from "lucide-react";
import { cookies } from "next/headers";
import { EmptyState } from "@/components/app/empty-state";
import { IntegrationsClient } from "@/components/app/integrations-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandsByUserId, getConnectionsByUserId, getOrCreateUser } from "@/lib/db";
import {
  OAUTH_DEBUG_COOKIE,
  parseOAuthDebugCookie,
} from "@/lib/integrations/oauth-debug";
import {
  getIntegrationsRuntimeConfig,
} from "@/lib/integrations/config";
import {
  isFacebookConfigured,
  isInstagramConfigured,
  metaRedirectUri,
} from "@/lib/social/meta";
import { isXConfigured, xRedirectUri } from "@/lib/social/x";
import { isPlatformAdmin } from "@/lib/server/platform-admin";
import { siteUrl } from "@/lib/brand";
import { requireUserId } from "@/lib/server/app-data";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string; detail?: string };
}) {
  const userId = await requireUserId();
  const cookieStore = cookies();
  const oauthDebug = parseOAuthDebugCookie(cookieStore.get(OAUTH_DEBUG_COOKIE)?.value);
  if (oauthDebug) {
    cookieStore.delete(OAUTH_DEBUG_COOKIE);
  }

  const [brands, connections, isAdmin, dbUser] = await Promise.all([
    getBrandsByUserId(userId),
    getConnectionsByUserId(userId),
    isPlatformAdmin(),
    getOrCreateUser(userId),
  ]);

  return (
    <SettingsShell
      title="Integrations"
      description="Connect the channels Kerygma Social publishes to after you approve posts."
    >
      {brands.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="No brands yet"
          description="Set up your brand first, then connect LinkedIn, Instagram, Facebook, and more."
        />
      ) : (
        <IntegrationsClient
          brands={brands.map((brand) => ({ id: brand.id, name: brand.name }))}
          initialDemoModeEnabled={dbUser.demoModeEnabled}
          initialConnections={connections.map((connection) => ({
            id: connection.id,
            brandId: connection.brandId,
            platform: connection.platform,
            accountName: connection.accountName,
            isDemo: connection.isDemo,
          }))}
          runtimeConfig={getIntegrationsRuntimeConfig()}
          metaSetup={{
            instagramConfigured: isInstagramConfigured(),
            facebookConfigured: isFacebookConfigured(),
            redirectUri: metaRedirectUri(),
            appUrl: siteUrl(),
            usesInstagramAppId: Boolean(process.env.INSTAGRAM_APP_ID?.trim()),
          }}
          xSetup={{
            configured: isXConfigured(),
            redirectUri: xRedirectUri(),
            appUrl: siteUrl(),
          }}
          flashParams={searchParams}
          oauthDebug={oauthDebug}
          showMetaAdminGuide={isAdmin}
          showXAdminGuide={isAdmin}
        />
      )}
    </SettingsShell>
  );
}
