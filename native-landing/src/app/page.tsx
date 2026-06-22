import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { PostCarousel } from "@/components/post-carousel";
import { HowItWorks } from "@/components/how-it-works";
import { Pricing } from "@/components/pricing";
import { Comparison, ComparisonTable } from "@/components/comparison";
import { TestimonialsSection } from "@/components/testimonials-section";
import { FAQ, Guides, CTASection, Footer } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PostCarousel />
        <HowItWorks />
        <Pricing />
        <Comparison />
        <TestimonialsSection />
        <ComparisonTable />
        <FAQ />
        <Guides />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
