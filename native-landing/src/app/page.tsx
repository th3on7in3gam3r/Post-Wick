import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PostCarousel } from "@/components/post-carousel";
import { HowItWorks } from "@/components/how-it-works";
import { SocialProofSection } from "@/components/social-proof-section";
import { Pricing } from "@/components/pricing";
import { Comparison, ComparisonTable } from "@/components/comparison";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FAQ, GraderPromoSection, Guides, CTASection, Footer } from "@/components/sections";
import { GrowthStackPromo } from "@/components/growth-stack-promo";
import { PostwickPromoSection } from "@/components/postwick-promo-section";
import { createPageMetadata } from "@/lib/metadata";
import { OG_DEFAULT_DESCRIPTION, OG_DEFAULT_TITLE } from "@/lib/brand";
import { homepageSoftwareJsonLd } from "@/lib/seo/structured-data";

export const metadata = createPageMetadata({
  description: OG_DEFAULT_DESCRIPTION,
  ogTitle: OG_DEFAULT_TITLE,
  ogDescription: OG_DEFAULT_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSoftwareJsonLd()) }}
      />
      <Navbar />
      <main>
        <Hero />
        <GraderPromoSection />
        <PostCarousel />
        <HowItWorks />
        <SocialProofSection />
        <PostwickPromoSection />
        <Pricing />
        <Comparison />
        <TestimonialsSection />
        <ComparisonTable />
        <FAQ />
        <GrowthStackPromo />
        <Guides />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
