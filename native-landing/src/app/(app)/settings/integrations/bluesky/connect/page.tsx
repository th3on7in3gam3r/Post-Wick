import { redirect } from "next/navigation";
import { BlueskyConnectClient } from "@/components/app/bluesky-connect-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandById } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export default async function BlueskyConnectPage({
  searchParams,
}: {
  searchParams: { brandId?: string };
}) {
  const userId = await requireUserId();
  const brandId = searchParams.brandId?.trim();

  if (!brandId) {
    redirect("/settings/integrations?error=invalid_callback");
  }

  const brand = await getBrandById(brandId, userId);
  if (!brand) {
    redirect("/settings/integrations?error=brand_not_found");
  }

  return (
    <SettingsShell
      title="Connect Bluesky"
      description={`Authorize publishing for ${brand.name} with AT Protocol OAuth.`}
    >
      <BlueskyConnectClient brandId={brandId} />
    </SettingsShell>
  );
}
