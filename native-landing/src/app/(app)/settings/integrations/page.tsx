import { Plug } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { IntegrationsClient } from "@/components/app/integrations-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandsByUserId, getConnectionsByUserId } from "@/lib/db";
import {
  getIntegrationsRuntimeConfig,
} from "@/lib/integrations/config";
import {
  isFacebookConfigured,
  isInstagramConfigured,
  metaRedirectUri,
} from "@/lib/social/meta";
import { isPlatformAdmin } from "@/lib/server/platform-admin";
import { siteUrl } from "@/lib/brand";
import { requireUserId } from "@/lib/server/app-data";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const userId = await requireUserId();
  const [brands, connections, showMetaAdminGuide] = await Promise.all([
    getBrandsByUserId(userId),
    getConnectionsByUserId(userId),
    isPlatformAdmin(),
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
          flashParams={searchParams}
          showMetaAdminGuide={showMetaAdminGuide}
        />
      )}
    </SettingsShell>
  );
}
