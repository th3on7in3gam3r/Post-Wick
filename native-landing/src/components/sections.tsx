import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";
import { TextureButton } from "@/components/ui/texture-button";

const faqs = [
  {
    q: "Do I need to be good at creating content to use this?",
    a: "Not at all. You don't need to write anything. Just add your website, and Post-Wick handles the rest — we research your business, create the content, and publish it automatically. You just approve what looks good.",
  },
  {
    q: "Will the content actually sound like my brand?",
    a: "Yes. Post-Wick researches your website, your industry, and your competitors to create content that fits your business. No generic templates. Just relevant, high-quality posts tailored to your brand.",
  },
  {
    q: "Will this work if I don't have a big following yet?",
    a: "Absolutely. Whether you have 200 followers or 20,000, Post-Wick helps you show up consistently across all your channels. That consistency is how you grow in the first place.",
  },
  {
    q: "What kind of content does Post-Wick create?",
    a: "Posts for Facebook, Instagram, LinkedIn, X, and more. We create a tailored content plan based on your business and generate posts optimized for each platform. Everything runs on autopilot.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your content and business information stay private. We use industry-standard encryption and secure cloud infrastructure. Your data stays yours, and we never sell it to third parties.",
  },
  {
    q: "Will this actually help my business?",
    a: "Most likely, yes. Consistent social media presence builds visibility, trust, and reach. That leads to more customers, more partnerships, and more growth. Post-Wick just makes it effortless.",
  },
];

export function FAQ() {
  return (
    <section className="bg-cream-dark px-10 py-24">
      <div className="mx-auto max-w-[800px]">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Frequently asked questions
        </h2>
        <p className="body-copy mt-3">
          In case you missed anything and had some more questions.
        </p>
        <div className="mt-10 space-y-6">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl bg-white p-5 shadow-card"
            >
              <summary className="cursor-pointer list-none font-medium text-near-black [&::-webkit-details-marker]:hidden">
                {item.q}
              </summary>
              <p className="body-copy mt-3">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Guides() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Guides &amp; insights
        </h2>
        <p className="body-copy mt-3">
          Practical tips on growing your business with consistent social media —
          articles coming soon.
        </p>
        <p className="mt-8 text-sm font-medium text-gray-label">
          Check back for launch updates, or{" "}
          <Link href="/contact" className="text-gold hover:opacity-80">
            get in touch
          </Link>{" "}
          if you&apos;d like early access.
        </p>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="bg-cream px-6 py-24 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2.5rem] shadow-[0_20px_60px_rgba(26,26,26,0.12)] md:min-h-[460px] md:rounded-[3rem]">
          <div
            className="absolute inset-0 bg-cover bg-[center_35%] bg-no-repeat md:bg-[center_right]"
            style={{ backgroundImage: "url('/images/cta-people-watercolor.png')" }}
            role="img"
            aria-label="Two people relaxing outdoors while using their phones"
          />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#2B2824]/90 via-[#2B2824]/55 to-[#2B2824]/15 md:from-[#2B2824]/85 md:via-[#2B2824]/40 md:to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[#2B2824]/40 via-transparent to-transparent md:hidden" />

          <div className="relative z-10 flex min-h-[420px] flex-col justify-center px-8 py-14 md:min-h-[460px] md:max-w-[52%] md:px-14 md:py-16">
            <h2 className="text-left font-playfair text-[clamp(2rem,4.5vw,3.25rem)] italic leading-[1.1] text-white">
              Take control of your social media.
            </h2>
            <p className="mt-4 max-w-md text-left text-[0.95rem] leading-relaxed text-white/85">
              Stop creating content yourself. Post-Wick does the work for you, around the
              clock.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TextureButton asChild variant="secondary" size="lg">
                <Link href="/sign-in">Log in</Link>
              </TextureButton>
              <TextureButton asChild variant="primary" size="lg">
                <Link href="/sign-up">Get started →</Link>
              </TextureButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#ddd] bg-cream px-10 py-12">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <BrandLogo href="/" variant="wordmark" />
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gray-label">
            Social media on autopilot
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-body">
          <Link href="/contact" className="hover:text-near-black">
            Contact
          </Link>
          <Link href="/privacy" className="hover:text-near-black">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-near-black">
            Terms
          </Link>
          <Link href="/cookies" className="hover:text-near-black">
            Cookies
          </Link>
          <CookieSettingsTrigger />
        </nav>
      </div>
    </footer>
  );
}
