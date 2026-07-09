import { Comparison, ComparisonTable } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
import { StudioBundleCta } from "@/components/studio-bundle-cta";
import { Navbar } from "@/components/navbar";
import { FAQ, Footer } from "@/components/sections";
import { createPageMetadata } from "@/lib/metadata";
import { pricingProductsJsonLd } from "@/lib/seo/structured-data";

const description =
  "Simple pricing for AI-generated social content. Start free with no credit card, then upgrade to Pro or Max for higher volume.";

export const metadata = createPageMetadata({
  title: "Pricing",
  description,
  ogTitle: "Pricing | Kerygma Social | Social media on autopilot for local businesses",
  ogDescription: description,
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingProductsJsonLd()) }}
      />
      <Navbar />
      <main>
        <Pricing
          headingTag="h1"
          heading="Affordable AI Social Media Pricing for Local Businesses & Churches"
        />
        <StudioBundleCta />
        <Comparison />
        <ComparisonTable />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
