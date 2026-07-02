import { AboutPageClient } from "@/components/about-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Meet Kerygma Social — AI social media on autopilot for local shops, studios, and faith communities. No blank captions. Just consistent posts.";

export const metadata = createPageMetadata({
  title: "About Kerygma Social | Autopilot for Locals",
  description,
  ogTitle: "About Kerygma Social — Social Media on Autopilot",
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
