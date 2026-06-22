import { HeroContent } from "./hero-content";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-landscape.svg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-cream" />

      <HeroContent />
    </section>
  );
}
