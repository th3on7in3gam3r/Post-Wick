import { redirect } from "next/navigation";
import { FacebookSelectPageClient } from "@/components/app/facebook-select-page-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandById } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export default async function FacebookSelectPage({
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
      title="Connect Facebook"
      description="Pick the Page you want Kerygma Social to publish to."
    >
      <FacebookSelectPageClient brandId={brandId} />
    </SettingsShell>
  );
}
