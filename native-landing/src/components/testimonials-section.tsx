import { SITE_NAME } from "@/lib/brand";

const ownerPainPoints = [
  {
    statement:
      "I know I should post more — I just don't have time between customers, staff, and everything else.",
    context: "Consistency without adding another job to your week.",
  },
  {
    statement:
      "Every time I open Instagram I freeze. Blank caption, close the app, try again next week.",
    context: "Drafts ready to review instead of starting from scratch.",
  },
  {
    statement:
      "We go quiet for a month, then panic-post three things in one day. That's not a strategy.",
    context: "A steady queue on autopilot — not feast-or-famine posting.",
  },
  {
    statement:
      "I want it to sound like us — not like every other generic small business online.",
    context: "Copy shaped from your website, industry, and brand voice.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-14 text-center">
          <p className="step-label">From owners like you</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            What business owners are looking for in a social media tool
          </h2>
          <p className="body-copy mx-auto mt-3 max-w-[620px]">
            Here&apos;s what we hear most — and what {SITE_NAME} is built to solve.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2">
          {ownerPainPoints.map((item) => (
            <li
              key={item.statement}
              className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card sm:p-8"
            >
              <blockquote className="border-l-2 border-gold/40 pl-5">
                <p className="font-playfair text-[1.1rem] italic leading-relaxed text-near-black">
                  &ldquo;{item.statement}&rdquo;
                </p>
              </blockquote>
              <p className="body-copy mt-5 text-[0.95rem] leading-relaxed text-gray-body">
                {item.context}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
