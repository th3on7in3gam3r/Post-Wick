import { Plug } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { IntegrationsClient } from "@/components/app/integrations-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandsByUserId, getConnectionsByUserId } from "@/lib/db";
import {
  getIntegrationsRuntimeConfig,
} from "@/lib/integrations/config";
import { isMetaConfigured, metaRedirectUri } from "@/lib/social/meta";
import { siteUrl } from "@/lib/brand";
import { requireUserId } from "@/lib/server/app-data";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const userId = await requireUserId();
  const [brands, connections] = await Promise.all([
    getBrandsByUserId(userId),
    getConnectionsByUserId(userId),
  ]);

  return (
    <SettingsShell
      title="Integrations"
      description="Connect the channels Post-Wick publishes to after you approve posts."
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
            configured: isMetaConfigured(),
            redirectUri: metaRedirectUri(),
            appUrl: siteUrl(),
          }}
          flashParams={searchParams}
        />
      )}
    </SettingsShell>
  );
}
