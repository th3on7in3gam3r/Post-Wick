import { HeroContent } from "./hero-content";
import { HomeWatercolorBackground } from "./home-watercolor-background";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <HomeWatercolorBackground />
      <HeroContent />
    </section>
  );
}
