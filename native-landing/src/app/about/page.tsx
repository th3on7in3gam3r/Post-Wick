import { AboutPageClient } from "@/components/about-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "We are Kerygma Social. We help local businesses and faith communities eliminate content bottlenecks with automated social posting. Discover our story!";

const title = "Meet the Team Behind Your Social Media Autopilot | Kerygma";

export const metadata = createPageMetadata({
  title: { absolute: title },
  description,
  ogTitle: title,
  ogDescription: description,
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingShell
      wide
      heroBackground="/images/comparison-autopilot-watercolor.png"
    >
      <AboutPageClient />
    </MarketingShell>
  );
}
