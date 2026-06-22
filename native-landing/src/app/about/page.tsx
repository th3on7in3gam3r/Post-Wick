import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about-page-client";
import { MarketingShell } from "@/components/marketing-shell";

export const metadata: Metadata = {
  title: "About — Post-Wick",
  description:
    "Meet the founder behind Post-Wick and Biblefunland Studios — social media on autopilot for small businesses.",
};

export default function AboutPage() {
  return (
    <MarketingShell wide>
      <AboutPageClient />
    </MarketingShell>
  );
}
