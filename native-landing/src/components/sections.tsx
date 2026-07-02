import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";
import { FaqJsonLd } from "@/components/faq-json-ld";
import { TextureButton } from "@/components/ui/texture-button";
import { BIBLEFUNLAND_STUDIOS_URL, SITE_TAGLINE } from "@/lib/brand";
import { INDUSTRY_FOOTER_LINKS } from "@/lib/industries/verticals";
import { SITE_FAQS } from "@/lib/faq";

export function FAQ() {
  return (
    <section className="bg-cream-dark px-10 py-24">
      <FaqJsonLd />
      <div className="mx-auto max-w-[800px]">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Frequently asked questions
        </h2>
        <p className="body-copy mt-3">
          In case you missed anything and had some more questions.
        </p>
        <div className="mt-10 space-y-6">
          {SITE_FAQS.map((item) => (
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

export function GraderPromoSection() {
  return (
    <section className="bg-cream px-6 py-16 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card md:flex-row md:items-center md:p-10">
          <div className="max-w-xl">
            <p className="step-label">Free tool</p>
            <h2 className="mt-2 font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
              How strong is your social presence?
            </h2>
            <p className="body-copy mt-3">
              Grade your Instagram or website in under a minute. No account required.
            </p>
          </div>
          <TextureButton asChild variant="accent" size="lg" className="shrink-0">
            <Link href="/tools/grading">Try the free grader →</Link>
          </TextureButton>
        </div>
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
              Stop creating content yourself. Kerygma Social does the work for you, around the
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
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <BrandLogo href="/" variant="wordmark" />
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-gray-label">
            {SITE_TAGLINE}
          </p>
          <p className="text-xs text-gray-label">
            A production of{" "}
            <Link
              href={BIBLEFUNLAND_STUDIOS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold/60"
            >
              BibleFunLand Studios
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
          <nav className="flex flex-col items-center gap-3 text-sm sm:items-start">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-label">
              Solutions by industry
            </p>
            <ul className="flex flex-col items-center gap-3 sm:items-start">
              {INDUSTRY_FOOTER_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link href={item.href} className="text-gray-body hover:text-near-black">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="flex flex-col items-center gap-3 text-sm sm:items-start">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-label">
              Explore
            </p>
            <Link href="/tools/grading" className="text-gray-body hover:text-near-black">
              Social grader
            </Link>
            <Link href="/directory" className="text-gray-body hover:text-near-black">
              Business directory
            </Link>
            <Link href="/agency" className="text-gray-body hover:text-near-black">
              Agency partners
            </Link>
          </nav>
          <nav className="flex flex-col items-center gap-3 text-sm sm:items-start">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-label">
              Legal
            </p>
            <Link href="/contact" className="text-gray-body hover:text-near-black">
              Contact
            </Link>
            <Link href="/privacy" className="text-gray-body hover:text-near-black">
              Privacy
            </Link>
            <Link href="/terms" className="text-gray-body hover:text-near-black">
              Terms
            </Link>
            <Link href="/cookies" className="text-gray-body hover:text-near-black">
              Cookies
            </Link>
            <CookieSettingsTrigger className="text-gray-body hover:text-near-black" />
          </nav>
        </div>
        </div>
      </div>
    </footer>
  );
}
