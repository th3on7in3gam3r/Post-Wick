import { Suspense } from "react";
import { AgencyReferralCapture } from "@/components/agency/agency-referral-capture";
import { HomeWatercolorBackground } from "@/components/home-watercolor-background";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./sections";

export function MarketingShell({
  children,
  wide = false,
  heroBackground = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
  heroBackground?: boolean;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <AgencyReferralCapture />
      </Suspense>
      <Navbar />
      <main
        className={cn(
          "relative z-0 min-h-screen px-6 pb-32 pt-32 md:px-10",
          heroBackground ? "overflow-hidden" : "bg-cream",
        )}
      >
        {heroBackground ? <HomeWatercolorBackground /> : null}
        <div
          className={cn(
            "relative z-10 mx-auto",
            wide ? "max-w-[1100px]" : "max-w-[720px]",
          )}
        >
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
