import { Navbar } from "@/components/native/navbar";
import { Hero } from "@/components/native/hero";
import { CookieBanner } from "@/components/native/cookie-banner";
import { PostCarousel } from "@/components/native/post-carousel";
import { HowItWorks } from "@/components/native/how-it-works";
import { Pricing } from "@/components/native/pricing";
import {
  Comparison,
  Testimonial,
  ComparisonTable,
} from "@/components/native/comparison";
import { FAQ, Guides, CTASection, Footer } from "@/components/native/sections";

export default function NativePreviewPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PostCarousel />
        <HowItWorks />
        <Pricing />
        <Comparison />
        <Testimonial />
        <ComparisonTable />
        <FAQ />
        <Guides />
        <CTASection />
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
