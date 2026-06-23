import { HeroContent } from "./hero-content";

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-24">
      <div
        className="absolute inset-0 bg-cover bg-[50%_38%] bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-landscape.svg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[#F2EBD9]/10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,235,217,0.5)_0%,rgba(242,235,217,0.15)_45%,transparent_72%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F2EBD9]/20 via-transparent to-cream" />

      <HeroContent />
    </section>
  );
}
