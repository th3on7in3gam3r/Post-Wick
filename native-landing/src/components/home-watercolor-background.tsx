export function HomeWatercolorBackground() {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-[50%_42%] bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-home-watercolor.png')" }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[#F2EBD9]/10" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,235,217,0.5)_0%,rgba(242,235,217,0.15)_45%,transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F2EBD9]/20 via-transparent to-cream"
        aria-hidden
      />
    </>
  );
}
