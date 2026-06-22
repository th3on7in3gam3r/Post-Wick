import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact-page-client";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "Contact — Post-Wick",
  description: "Get in touch with the Post-Wick team.",
};

export default function ContactPage() {
  return (
    <MarketingShell wide>
      <ContactPageClient />
    </MarketingShell>
  );
}
