import { Link2 } from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { ConnectionsClient } from "@/components/app/connections-client";
import { EmptyState } from "@/components/app/empty-state";
import { getBrandsByUserId, getConnectionsByUserId } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

function flashMessage(searchParams: {
  connected?: string;
  error?: string;
}) {
  if (searchParams.connected === "linkedin") {
    return "LinkedIn connected successfully. Approved posts can now publish when they are due.";
  }
  if (searchParams.error === "linkedin_exchange_failed") {
    return "LinkedIn authorization failed. Try again or use demo mode.";
  }
  if (searchParams.error) {
    return "Connection failed. Please try again.";
  }
  return null;
}

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: { connected?: string; error?: string };
}) {
  const userId = await requireUserId();
  const brands = getBrandsByUserId(userId);
  const connections = getConnectionsByUserId(userId);
  const linkedInConfigured = Boolean(process.env.LINKEDIN_CLIENT_ID);

  return (
    <>
      <AppHeader
        title="Connections"
        description="Link the channels autopilot will publish to."
      />
      <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
        {brands.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No brands yet"
            description="Set up your brand first, then connect LinkedIn or use demo mode to test publishing."
          />
        ) : (
          <ConnectionsClient
            brands={brands.map((brand) => ({ id: brand.id, name: brand.name }))}
            initialConnections={connections.map((connection) => ({
              id: connection.id,
              brandId: connection.brandId,
              platform: connection.platform,
              accountName: connection.accountName,
              isDemo: connection.isDemo,
            }))}
            linkedInConfigured={linkedInConfigured}
            flash={flashMessage(searchParams)}
          />
        )}
      </div>
    </>
  );
}
