import Link from "next/link";
import {
  GuideHeroPanel,
  guideHeroLeadClassName,
  guideHeroTitleClassName,
} from "@/components/guides/guide-hero-panel";
import { TextureButton } from "@/components/ui/texture-button";
import type { IndustryVertical } from "@/lib/industries/verticals";

export function IndustryLandingTemplate({ vertical }: { vertical: IndustryVertical }) {
  return (
    <article className="mx-auto max-w-[760px]">
      <GuideHeroPanel>
        <span className="inline-block rounded-full bg-white/95 px-4 py-1.5 text-sm font-medium text-near-black shadow-sm">
          Solutions by industry
        </span>
        <h1 className={`mt-6 ${guideHeroTitleClassName}`}>
          Social Media Automation for {vertical.title}
        </h1>
        <p className={`${guideHeroLeadClassName} max-w-[600px]`}>{vertical.intro}</p>
      </GuideHeroPanel>

      <section className="mt-12 space-y-5 rounded-3xl border border-black/[0.06] bg-white p-8 shadow-card md:p-10">
        {vertical.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className="body-copy text-[1.05rem] leading-relaxed">
            {paragraph}
          </p>
        ))}

        <div className="rounded-2xl border border-gold/20 bg-cream/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-label">
            Built for {vertical.title.toLowerCase()}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-body">
            {vertical.highlights.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <TextureButton asChild variant="accent" size="lg" className="sm:flex-1">
            <Link href="/pricing">See pricing for {vertical.title.toLowerCase()}</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg" className="sm:flex-1">
            <Link href="/sign-up">Start free →</Link>
          </TextureButton>
        </div>
      </section>
    </article>
  );
}
