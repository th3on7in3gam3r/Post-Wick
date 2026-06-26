import { AboutPageClient } from "@/components/about-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Meet the founder behind Kerygma Social — social media on autopilot for local businesses of every kind.";

export const metadata = createPageMetadata({
  title: "About",
  description,
  ogTitle: "About Kerygma Social | Social media on autopilot for local businesses",
  ogDescription: description,
  path: "/about",
});

export default function AboutPage() {
  return (
    <MarketingShell wide>
      <AboutPageClient />
    </MarketingShell>
  );
}
