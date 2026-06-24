import { Comparison, ComparisonTable } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
import { Navbar } from "@/components/navbar";
import { FAQ, Footer } from "@/components/sections";
import { createPageMetadata } from "@/lib/metadata";

const description =
  "Simple pricing for AI-generated social content. Pro and Max plans with monthly or yearly billing.";

export const metadata = createPageMetadata({
  title: "Pricing",
  description,
  ogTitle: "Pricing | Post-Wick | Social media on autopilot for local businesses",
  ogDescription: description,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Pricing />
        <Comparison />
        <ComparisonTable />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
