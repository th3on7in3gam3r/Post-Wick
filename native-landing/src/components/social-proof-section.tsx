/* PLACEHOLDER TESTIMONIALS — swap for real customer quotes when available. */
const placeholderTestimonials = [
  {
    quote:
      "I run morning classes and evening sessions — I don't have time to write captions. Post-Wick drafts promos and member spotlights that actually sound like our studio.",
    name: "Elena Vasquez",
    role: "Owner · Harbor Pilates Studio",
    initials: "EV",
  },
  {
    quote:
      "We dropped in our website and had a month of coffee-shop posts ready to review. Seasonal drinks, slow mornings, regulars at the counter — all on brand.",
    name: "Marcus Chen",
    role: "Owner · Ember & Oak Coffee",
    initials: "MC",
  },
  {
    quote:
      "Before-and-afters, stylist spotlights, booking reminders — it's handled while I'm behind the chair. I approve in a few minutes on my lunch break.",
    name: "Aisha Williams",
    role: "Owner · Strand Hair Co.",
    initials: "AW",
  },
] as const;

const stats = [
  { value: "500+", label: "posts generated" },
  { value: "50+", label: "local businesses" },
  { value: "3 min", label: "setup" },
] as const;

export function SocialProofSection() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 rounded-2xl bg-panel-bg p-8 sm:grid-cols-3 md:p-10">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-playfair text-[clamp(2rem,4vw,2.75rem)] italic text-gold">
                {stat.value}
              </p>
              <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="step-label">Trusted by local owners</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            Built for businesses like yours
          </h2>
          <p className="body-copy mx-auto mt-3 max-w-[560px]">
            Owners who would rather run their shop than stare at a blank caption box.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {placeholderTestimonials.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card"
            >
              <p className="font-playfair text-[1.05rem] italic leading-relaxed text-near-black">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-[#E8E4D9] pt-5">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-semibold text-gold"
                  aria-hidden
                >
                  {item.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-near-black">{item.name}</p>
                  <p className="text-sm text-gray-label">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
