import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { CookieSettingsTrigger } from "@/components/cookie-settings-trigger";
import { FaqJsonLd } from "@/components/faq-json-ld";
import { TextureButton } from "@/components/ui/texture-button";
import { BIBLEFUNLAND_STUDIOS_URL, SITE_TAGLINE } from "@/lib/brand";
import { GROWTH_STACK } from "@/lib/growth-stack";
import { GUIDE_ARTICLES } from "@/lib/guides";
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
      <div className="mx-auto max-w-[900px] text-center">
        <h2 className="font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Guides &amp; insights
        </h2>
        <p className="body-copy mt-3">
          Clear answers to buyer questions — including pricing, workflows, and who
          Kerygma Social is built for.
        </p>
        <ul className="mt-10 grid gap-5 text-left sm:grid-cols-2">
          {GUIDE_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/guides/${article.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card transition hover:border-gold/30"
              >
                <h3 className="font-playfair text-lg italic text-near-black group-hover:text-gold">
                  {article.title}
                </h3>
                <p className="body-copy mt-2 flex-1 text-sm">{article.summary}</p>
                <span className="mt-4 text-sm font-medium text-gold">Read guide →</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <TextureButton asChild variant="minimal" size="sm">
            <Link href="/guides">View all guides</Link>
          </TextureButton>
        </div>
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
          {/* MoneyGap AI Growth Badge */}
          <a
            href="chrome-extension://jkiobeigkpeniaejapgghbpipobjpnld/report.html?id=report_oo97vuzs"
            rel="noopener noreferrer"
            target="_blank"
            className="mt-3"
            style={{ display: "inline-block", lineHeight: 0, textDecoration: "none" }}
            title="MoneyGap Score™ 77"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="data:image/svg+xml;charset=utf-8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E%0A%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%2256%22%20viewBox%3D%220%200%20200%2056%22%20role%3D%22img%22%20aria-label%3D%22MoneyGap%20Score%2077%22%3E%0A%20%20%3Cdefs%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22mgBg%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230f1c2e%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%2316324f%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3ClinearGradient%20id%3D%22mgMark%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%232dd4bf%22%2F%3E%0A%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%230d9488%22%2F%3E%0A%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%3C%2Fdefs%3E%0A%20%20%3Crect%20x%3D%220.5%22%20y%3D%220.5%22%20width%3D%22199%22%20height%3D%2255%22%20rx%3D%2212%22%20fill%3D%22url(%23mgBg)%22%20stroke%3D%22%232a3f55%22%2F%3E%0A%20%20%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%2240%22%20height%3D%2240%22%20rx%3D%2210%22%20fill%3D%22url(%23mgMark)%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M18%2034%20L28%2016%20L38%2034%22%20fill%3D%22none%22%20stroke%3D%22%230f1c2e%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%0A%20%20%3Cpath%20d%3D%22M22%2034%20H34%22%20fill%3D%22none%22%20stroke%3D%22%230f1c2e%22%20stroke-width%3D%222.4%22%20stroke-linecap%3D%22round%22%2F%3E%0A%20%20%3Ctext%20x%3D%2260%22%20y%3D%2222%22%20fill%3D%22%2394a3b8%22%20font-family%3D%22ui-sans-serif%2Csystem-ui%2C-apple-system%2CSegoe%20UI%2Csans-serif%22%20font-size%3D%229%22%20font-weight%3D%22700%22%20letter-spacing%3D%220.12em%22%3EMONEYGAP%20AI%3C%2Ftext%3E%0A%20%20%3Ctext%20x%3D%2260%22%20y%3D%2240%22%20fill%3D%22%23f8fafc%22%20font-family%3D%22ui-sans-serif%2Csystem-ui%2C-apple-system%2CSegoe%20UI%2Csans-serif%22%20font-size%3D%2213%22%20font-weight%3D%22700%22%3EScore%E2%84%A2%3C%2Ftext%3E%0A%20%20%3Ctext%20x%3D%22188%22%20y%3D%2236%22%20text-anchor%3D%22end%22%20fill%3D%22%230d9488%22%20font-family%3D%22ui-sans-serif%2Csystem-ui%2C-apple-system%2CSegoe%20UI%2Csans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22800%22%3E77%3C%2Ftext%3E%0A%3C%2Fsvg%3E"
              alt="MoneyGap Score™ 77"
              width={200}
              height={56}
              style={{ display: "block", border: 0, borderRadius: 12 }}
            />
          </a>
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
              Growth stack
            </p>
            <Link
              href={GROWTH_STACK.citePilot.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              CitePilot
            </Link>
            <Link
              href={GROWTH_STACK.signalDesk.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              SignalDesk Blog
            </Link>
            <Link
              href={GROWTH_STACK.aiCmo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              Cadence
            </Link>
            <Link
              href={GROWTH_STACK.aegis.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              Aegis Loop
            </Link>
            <Link
              href={GROWTH_STACK.moneyGap.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              MoneyGap AI
            </Link>
            <Link
              href={GROWTH_STACK.postwick.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-body hover:text-near-black"
            >
              Postwick
            </Link>
          </nav>
          <nav className="flex flex-col items-center gap-3 text-sm sm:items-start">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-label">
              Explore
            </p>
            <Link href="/tools/grading" className="text-gray-body hover:text-near-black">
              Social grader
            </Link>
            <Link href="/guides/free-plan" className="text-gray-body hover:text-near-black">
              Free plan
            </Link>
            <Link
              href="/guides/10-ai-generated-posts-per-month"
              className="text-gray-body hover:text-near-black"
            >
              10 posts/month
            </Link>
            <Link href="/guides" className="text-gray-body hover:text-near-black">
              Guides
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
