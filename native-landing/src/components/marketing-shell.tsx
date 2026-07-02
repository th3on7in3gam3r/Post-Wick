import { Suspense } from "react";
import { AgencyReferralCapture } from "@/components/agency/agency-referral-capture";
import { HomeWatercolorBackground } from "@/components/home-watercolor-background";
import { MarketingWatercolorBackground } from "@/components/marketing-watercolor-background";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Footer } from "./sections";

const DEFAULT_HERO_IMAGE = "/images/hero-home-watercolor.png";

export function MarketingShell({
  children,
  wide = false,
  heroBackground = false,
  backgroundImage,
  backgroundPosition,
}: {
  children: React.ReactNode;
  wide?: boolean;
  /** `true` uses the homepage watercolor; a string uses that image path instead. */
  heroBackground?: boolean | string;
  backgroundImage?: string;
  backgroundPosition?: string;
}) {
  const resolvedImage =
    backgroundImage ??
    (typeof heroBackground === "string"
      ? heroBackground
      : heroBackground
        ? DEFAULT_HERO_IMAGE
        : null);
  const useDefaultHomeLayers = heroBackground === true && !backgroundImage;

  return (
    <>
      <Suspense fallback={null}>
        <AgencyReferralCapture />
      </Suspense>
      <Navbar />
      <main
        className={cn(
          "relative z-0 min-h-screen px-6 pb-32 pt-32 md:px-10",
          resolvedImage ? "overflow-hidden" : "bg-cream",
        )}
      >
        {useDefaultHomeLayers ? <HomeWatercolorBackground /> : null}
        {resolvedImage && !useDefaultHomeLayers ? (
          <MarketingWatercolorBackground
            imageSrc={resolvedImage}
            imagePosition={backgroundPosition}
          />
        ) : null}
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
