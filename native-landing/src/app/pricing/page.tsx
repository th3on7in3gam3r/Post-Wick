import type { Metadata } from "next";
import { Comparison, ComparisonTable } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
import { Navbar } from "@/components/navbar";
import { FAQ, Footer } from "@/components/sections";

export const metadata: Metadata = {
  title: "Pricing — Post-Wick",
  description:
    "Simple pricing for AI-generated social content. Pro and Max plans with monthly or yearly billing.",
};

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
