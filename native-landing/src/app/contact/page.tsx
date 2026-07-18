import { ContactPageClient } from "@/components/contact-page-client";
import { MarketingShell } from "@/components/marketing-shell";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Need help automating your brand's social presence? Get in touch with the Kerygma Social team today. We reply in under 24 business hours!";

const title = "Contact Us - Let's Put Your Social Media on Autopilot";

export const metadata = createPageMetadata({
  title: { absolute: title },
  description,
  ogTitle: title,
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
