type MarketingWatercolorBackgroundProps = {
  imageSrc: string;
  imagePosition?: string;
};

export function MarketingWatercolorBackground({
  imageSrc,
  imagePosition = "50% 42%",
}: MarketingWatercolorBackgroundProps) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${imageSrc}')`,
          backgroundPosition: imagePosition,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-[#F2EBD9]/5" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(242,235,217,0.22)_0%,rgba(242,235,217,0.06)_45%,transparent_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F2EBD9]/10 via-transparent to-cream/80"
        aria-hidden
      />
    </>
  );
}
