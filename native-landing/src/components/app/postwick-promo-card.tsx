import Link from "next/link";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";
import { postwickBaseUrl } from "@/lib/directory/public-brands";

function postwickPromoHref() {
  return postwickBaseUrl() ?? "https://postwick.com";
}

export function PostwickPromoCard() {
  return (
    <PanelCard
      title="Postwick"
      description="The public posts network for brands — sister to Kerygma Social."
    >
      <p className="text-sm text-gray-body">
        Explore the new Postwick site, then connect your brand from Integrations so
        published posts can auto-share.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <TextureButton asChild variant="accent" size="sm">
          <Link href={postwickPromoHref()} target="_blank" rel="noopener noreferrer">
            Visit Postwick →
          </Link>
        </TextureButton>
        <Link
          href="/settings/integrations"
          className="text-sm font-medium text-gold hover:underline"
        >
          Connect from Integrations
        </Link>
      </div>
    </PanelCard>
  );
}
