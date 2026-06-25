import { ContactPageClient } from "@/components/contact-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description = "Get in touch with the Kerygma Social team.";

export const metadata = createPageMetadata({
  title: "Contact",
  description,
  ogTitle: "Contact Kerygma Social | Social media on autopilot for local businesses",
  ogDescription: description,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <MarketingShell wide>
      <ContactPageClient />
    </MarketingShell>
  );
}
