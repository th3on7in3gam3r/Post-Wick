import Link from "next/link";
import { HowItWorksHeading } from "@/components/how-it-works-heading";
import { TextureButton } from "@/components/ui/texture-button";

const steps = [
  {
    number: "01",
    label: "Add your website",
    title: "Add your website.",
    body: "You add your website. Kerygma Social does the research on your business, your industry, and your competitors. The rest runs on autopilot.",
    reverse: false,
    panel: (
      <div className="space-y-4 rounded-2xl bg-panel-bg p-6">
        <div className="rounded-full border border-[#ddd] bg-white px-4 py-3 text-sm text-gray-label">
          yourcompany.com
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
              Industry
            </p>
            <p className="mt-1 font-playfair italic text-near-black">
              Wellness. Sea sauna.
            </p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
              Voice
            </p>
            <p className="mt-1 font-playfair italic text-near-black">
              Warm and grounded. Speaks of presence and nature.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
            First post
          </p>
          <p className="mt-1 font-playfair italic text-near-black">
            After a long day in the sauna
          </p>
        </div>
      </div>
    ),
  },
  {
    number: "02",
    label: "Analysis and content",
    title: "We do the work.",
    body: "While you wait, Kerygma Social does the research on your business, your industry, and your competitors. We set up a tailored content plan and generate posts for each of your channels.",
    reverse: true,
    panel: (
      <div className="space-y-3 rounded-2xl bg-panel-bg p-6">
        <div className="flex flex-wrap gap-2">
          {[
            "Reading the site",
            "Extracting brand DNA",
            "Mapping competitors",
            "Profiling audience",
            "Drafting content plan",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full bg-white px-3 py-1.5 text-[0.75rem] text-gray-body"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="text-sm text-gold">nordlys-sea-sauna.com</p>
        <div className="rounded-xl bg-white p-4">
          <p className="font-semibold text-near-black">Nordlys Sea Sauna</p>
          <p className="text-sm text-gray-body">
            A sauna by the fjord. Since 2018.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[0.75rem] text-gray-label">
          {["Brand", "Competitors", "Audience", "This week", "3. Automatic publishing"].map(
            (tab) => (
              <span key={tab} className="rounded-full border border-[#ddd] px-3 py-1">
                {tab}
              </span>
            ),
          )}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    label: "Approve and publish",
    title: "You approve. We publish.",
    body: "Kerygma Social drafts the posts. You swipe right to approve, left to skip. The rest runs on autopilot.",
    reverse: false,
    panel: (
      <div className="grid gap-3 rounded-2xl bg-panel-bg p-6 sm:grid-cols-3">
        {[
          {
            platform: "LinkedIn",
            title: "Why we use three weather models, not one",
            sub: "The multi-source approach that turns uncertainty into confidence.",
          },
          {
            platform: "Instagram",
            title: "New kitchen, new possibilities",
            sub: "The dream home is finally complete. Natural materials, warm tones.",
          },
          {
            platform: "Pinterest",
            title: "After a long day in the sauna",
            sub: "Nothing beats the fresh sea air. Experiences you'll never forget.",
          },
        ].map((post) => (
          <div key={post.platform} className="rounded-xl bg-white p-4 shadow-card">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-gold">
              {post.platform} · AI suggestion
            </p>
            <p className="mt-2 font-playfair text-sm italic text-near-black">
              {post.title}
            </p>
            <p className="mt-1 text-xs text-gray-body">{post.sub}</p>
          </div>
        ))}
        <div className="col-span-full rounded-xl bg-white p-4 text-center">
          <p className="font-playfair text-2xl italic text-gold">12</p>
          <p className="text-sm text-gray-body">in queue · Swipe or use the buttons</p>
          <p className="mt-2 text-xs text-gray-label">Recent · Your swipes will appear here.</p>
        </div>
      </div>
    ),
  },
  {
    number: "04",
    label: "Refine",
    title: "Tell Kerygma Social what to change. It does it.",
    body: "Almost love the post, but not quite? Describe it in plain words. Kerygma Social rewrites the caption, generates new image variations, and lets you pick your favorite.",
    reverse: true,
    panel: (
      <div className="rounded-2xl bg-panel-bg p-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-label">
          <span className="font-semibold text-near-black">Nordlys Sea Sauna</span>
          <span>Instagram · Today</span>
        </div>
        <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-gray-label">
          Caption
        </p>
        <p className="font-playfair italic text-near-black">
          After a long day in the sauna, nothing beats the fresh sea air.
        </p>
        <div className="mt-4 rounded-xl border border-[#ddd] bg-white p-4">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-gold">
            Refine · Kerygma Social AI
          </p>
          <p className="mt-2 text-sm text-gray-label">
            Describe what you&apos;d like to change…
          </p>
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-32 bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <HowItWorksHeading />

        <div className="mt-16 space-y-8">
          {steps.map((step) => (
            <article
              key={step.number}
              className="relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card sm:p-10 lg:p-12"
            >
              <span
                aria-hidden
                className={
                  step.reverse
                    ? "pointer-events-none absolute -right-2 -top-4 select-none font-playfair text-[clamp(7rem,18vw,12rem)] leading-none text-[#E8E4DC] sm:-right-1 sm:-top-6"
                    : "pointer-events-none absolute -left-2 -top-4 select-none font-playfair text-[clamp(7rem,18vw,12rem)] leading-none text-[#E8E4DC] sm:-left-1 sm:-top-6"
                }
              >
                {step.number}
              </span>

              <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
                <div className={step.reverse ? "lg:order-2" : undefined}>
                  <p className="step-label">{step.label}</p>
                  <h3 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
                    {step.title}
                  </h3>
                  <p className="body-copy mt-4 max-w-lg">{step.body}</p>
                  <div className="mt-6 flex gap-3">
                    <TextureButton asChild variant="secondary" size="default">
                      <Link href="/sign-in">Log in</Link>
                    </TextureButton>
                    <TextureButton asChild variant="primary" size="default">
                      <Link href="/sign-up">Get started</Link>
                    </TextureButton>
                  </div>
                </div>
                <div className={step.reverse ? "lg:order-1" : undefined}>
                  {step.panel}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
