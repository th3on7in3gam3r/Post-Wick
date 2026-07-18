import { Comparison, ComparisonTable } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
import { StudioBundleCta } from "@/components/studio-bundle-cta";
import { Navbar } from "@/components/navbar";
import { FAQ, Footer } from "@/components/sections";
import { createPageMetadata } from "@/lib/metadata";
import { pricingProductsJsonLd } from "@/lib/seo/structured-data";

const description =
  "Simple, transparent pricing for automated local business social media management. Save hours weekly with our Pro and Max plans. Get started today!";

export const metadata = createPageMetadata({
  title: "Affordable Social Media Automation Pricing",
  description,
  ogTitle: "Affordable Social Media Automation Pricing | Kerygma Social",
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
