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
import { createPageMetadata } from "@/lib/metadata";
import { homepageSoftwareJsonLd } from "@/lib/seo/structured-data";

export const metadata = createPageMetadata({ path: "/" });

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
