import { redirect } from "next/navigation";
import { PinterestSelectBoardClient } from "@/components/app/pinterest-select-board-client";
import { SettingsShell } from "@/components/app/settings-shell";
import { getBrandById } from "@/lib/db";
import { requireUserId } from "@/lib/server/app-data";

export default async function PinterestSelectBoardPage({
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
      title="Connect Pinterest"
      description="Pick the board where approved image posts should become pins."
    >
      <PinterestSelectBoardClient brandId={brandId} />
    </SettingsShell>
  );
}
