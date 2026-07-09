import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { GUIDE_ARTICLES } from "@/lib/guides";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Guides & insights",
  description:
    "Practical guides on social media automation, pricing, and growing your local business with Kerygma Social.",
  ogTitle: "Guides & insights | Kerygma Social",
  path: "/guides",
});

export default function GuidesPage() {
  return (
    <MarketingShell wide heroBackground="/images/comparison-autopilot-watercolor.png">
      <div className="mx-auto max-w-[900px]">
        <header className="text-center">
          <h1 className="font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
            Guides &amp; insights
          </h1>
          <p className="body-copy mx-auto mt-4 max-w-[600px]">
            Clear answers to the questions buyers and AI search engines ask about
            Kerygma Social — pricing, workflows, and who we&apos;re built for.
          </p>
        </header>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {GUIDE_ARTICLES.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/guides/${article.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card transition hover:border-gold/30 hover:shadow-md"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
                  Guide
                </p>
                <h2 className="mt-2 font-playfair text-xl italic text-near-black group-hover:text-gold">
                  {article.title}
                </h2>
                <p className="body-copy mt-3 flex-1 text-sm">{article.summary}</p>
                <span className="mt-4 text-sm font-medium text-gold">Read guide →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </MarketingShell>
  );
}
