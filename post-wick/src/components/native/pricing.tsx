import Link from "next/link";

const channels = [
  "Facebook",
  "Instagram",
  "LinkedIn",
  "X",
  "TikTok",
  "Pinterest",
  "Reddit",
  "Bluesky",
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <p className="step-label">Pricing</p>
        <h2 className="mt-3 font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
          One plan for autopilot.
        </h2>
        <p className="body-copy mt-3">
          Pick the AI allowance that matches your growth ambitions.
        </p>

        <div className="mt-6 inline-flex rounded-full bg-white p-1 text-sm">
          <button type="button" className="rounded-full px-4 py-1.5 text-gray-body">
            Monthly
          </button>
          <button
            type="button"
            className="rounded-full bg-native-black px-4 py-1.5 text-white"
          >
            Yearly <span className="text-gold">−20%</span>
          </button>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-gold bg-white p-8 shadow-card">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gold">
              Best for growth
            </p>
            <h3 className="mt-2 font-playfair text-2xl italic">Pro</h3>
            <p className="mt-2 text-sm text-gray-body">
              A whole month of content, ready for your approval.
            </p>
            <p className="mt-6 font-playfair text-5xl italic text-near-black">$63</p>
            <p className="text-sm text-gray-label">per month, billed yearly · excl. VAT</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-body">
              <li>50+ posts a month, ready for approval</li>
              <li>Tailored to your tone and industry</li>
              <li>All your channels: Facebook, Instagram, LinkedIn and 5 more</li>
              <li>Auto-publishing once you approve</li>
              <li>Analytics on what&apos;s working</li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-full bg-native-black py-3 text-center text-sm font-medium text-white"
            >
              See your own posts
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-card">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-label">
              For teams scaling
            </p>
            <h3 className="mt-2 font-playfair text-2xl italic">Max</h3>
            <p className="mt-2 text-sm text-gray-body">
              Higher AI allowance and priority support for teams running multiple
              brands.
            </p>
            <p className="mt-6 font-playfair text-5xl italic text-near-black">$199</p>
            <p className="text-sm text-gray-label">per month, billed yearly · excl. VAT</p>
            <ul className="mt-6 space-y-2 text-sm text-gray-body">
              <li>Everything in Pro, plus</li>
              <li>5× AI usage</li>
              <li>Priority support</li>
              <li>Early access to new features</li>
            </ul>
            <Link
              href="/sign-up"
              className="mt-8 block w-full rounded-full border border-near-black py-3 text-center text-sm font-medium"
            >
              Get started with Max
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-body">
          All these channels can be connected to every brand
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {channels.map((ch) => (
            <span
              key={ch}
              className="rounded-full bg-white px-4 py-2 text-sm text-near-black shadow-card"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
