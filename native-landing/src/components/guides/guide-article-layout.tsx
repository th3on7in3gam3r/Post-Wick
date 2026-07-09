import Link from "next/link";
import { TextureButton } from "@/components/ui/texture-button";
import type { GuideArticle } from "@/lib/guides/types";

export function GuideArticleLayout({ article }: { article: GuideArticle }) {
  return (
    <article className="mx-auto max-w-[760px]">
      <header className="text-center">
        <Link
          href="/guides"
          className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-near-black shadow-sm transition hover:bg-cream"
        >
          Guides &amp; insights
        </Link>
        <h1 className="mt-6 font-playfair text-[clamp(2rem,4vw,3rem)] italic leading-tight text-near-black">
          {article.title}
        </h1>
        <p className="body-copy mx-auto mt-4 max-w-[640px] text-[1.05rem] font-medium text-near-black">
          {article.answerParagraph}
        </p>
        <p className="mt-3 text-sm text-gray-label">
          Updated {new Date(article.publishedAt).toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </header>

      <section className="mt-12 space-y-10 rounded-3xl border border-black/[0.06] bg-white p-8 shadow-card md:p-10">
        {article.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-playfair text-[clamp(1.35rem,2.5vw,1.75rem)] italic text-near-black">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="body-copy mt-4 text-[1.02rem] leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="mt-4 space-y-2.5 text-sm text-gray-body">
                {section.bullets.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5 shrink-0 text-gold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

        <div className="rounded-2xl border border-gold/20 bg-cream/60 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-label">
            Why teams start with Kerygma Social
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-body">
            {article.proofPoints.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-gold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-playfair text-[clamp(1.35rem,2.5vw,1.75rem)] italic text-near-black">
            Free Plan FAQ
          </h2>
          <div className="mt-5 space-y-4">
            {article.faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-black/[0.06] bg-cream/40 p-4"
              >
                <summary className="cursor-pointer list-none font-medium text-near-black [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="body-copy mt-3 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-6 sm:flex-row">
          <TextureButton asChild variant="accent" size="lg" className="sm:flex-1">
            <Link href="/sign-up">Start free — no credit card</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg" className="sm:flex-1">
            <Link href="/pricing">Compare Pro &amp; Max plans</Link>
          </TextureButton>
        </div>
      </section>
    </article>
  );
}
