import { ContactPageClient } from "@/components/contact-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Questions about AI social posting for your shop, studio, or church? Contact Kerygma Social — we reply within one business day.";

export const metadata = createPageMetadata({
  title: "Contact Kerygma Social | We're Here to Help",
  description,
  ogTitle: "Contact Kerygma Social — Talk to Our Team",
  ogDescription: description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <MarketingShell
      wide
      heroBackground="/images/comparison-autopilot-watercolor.png"
    >
      <ContactPageClient />
    </MarketingShell>
  );
}
