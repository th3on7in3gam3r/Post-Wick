/* Illustrative use cases — not customer endorsements. Swap for real,
   attributable testimonials only once you have consent to publish them. */
const useCases = [
  {
    business: "Pilates & fitness studios",
    scenario:
      "Morning classes and evening sessions leave no time to write captions.",
    handled:
      "Kerygma Social drafts class promos and member spotlights in your studio's voice — ready to review.",
  },
  {
    business: "Coffee shops & cafés",
    scenario:
      "Seasonal drinks and slow mornings are worth sharing, but posting slips through the cracks.",
    handled:
      "Drop in your website and get a month of on-brand posts to approve in minutes.",
  },
  {
    business: "Salons & studios",
    scenario:
      "Before-and-afters, stylist spotlights, and booking reminders pile up behind the chair.",
    handled:
      "It's drafted for you — approve on your lunch break and let it publish on autopilot.",
  },
] as const;

const facts = [
  { value: "4", label: "channels supported" },
  { value: "$0", label: "to start — no credit card" },
  { value: "3 min", label: "setup" },
] as const;

export function SocialProofSection() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 rounded-2xl bg-panel-bg p-8 sm:grid-cols-3 md:p-10">
          {facts.map((fact) => (
            <div key={fact.label} className="text-center">
              <p className="font-playfair text-[clamp(2rem,4vw,2.75rem)] italic text-gold">
                {fact.value}
              </p>
              <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
                {fact.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="step-label">Built for local businesses</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            Made for how local owners actually work
          </h2>
          <p className="body-copy mx-auto mt-3 max-w-[560px]">
            A few examples of what Kerygma Social handles day to day for owners who
            would rather run their shop than stare at a blank caption box.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {useCases.map((item) => (
            <article
              key={item.business}
              className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-gold">
                {item.business}
              </p>
              <p className="mt-4 font-playfair text-[1.05rem] italic leading-relaxed text-near-black">
                {item.scenario}
              </p>
              <p className="body-copy mt-auto border-t border-[#E8E4D9] pt-5 text-[0.95rem] leading-relaxed text-gray-body">
                {item.handled}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-gray-label">
          Illustrative examples, not customer endorsements.
        </p>
      </div>
    </section>
  );
}
