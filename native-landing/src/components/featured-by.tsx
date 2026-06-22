export function FeaturedBy() {
  const logos = ["Shifter", "E24", "DN", "Finansavisen"];

  return (
    <section className="border-b border-[#E0DDD4] bg-cream py-10">
      <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
        As featured by
      </p>
      <div className="mx-auto mt-5 flex max-w-[900px] flex-wrap items-center justify-center gap-x-12 gap-y-4 px-10">
        {logos.map((name) => (
          <span
            key={name}
            className="font-playfair text-[1.1rem] italic text-near-black/45"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
