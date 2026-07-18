import Link from "next/link";
import { BIBLEFUNLAND_STUDIOS_URL, GROWTH_STACK } from "@/lib/growth-stack";
import { TextureButton } from "@/components/ui/texture-button";

const PATH = [
  { key: "citePilot" as const, label: "Start here", accent: "text-gold", current: false },
  { key: "aiCmo" as const, label: "Then", accent: "text-[#5B4FCF]", current: false },
  { key: "aegis" as const, label: "Then", accent: "text-[#2D6A4F]", current: false },
  { key: "kerygma" as const, label: "You are here", accent: "text-gold", current: true },
  { key: "postwick" as const, label: "Then", accent: "text-[#8B6914]", current: false },
];

export function GrowthStackPromo() {
  return (
    <section className="bg-cream-dark px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="step-label">Growth stack</p>
        <h2 className="mt-2 max-w-2xl font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          A simple path — citations, strategy, security, social, discovery
        </h2>
        <p className="body-copy mt-3 max-w-2xl">
          Start with CitePilot, then Cadence, then Aegis before you publish with Kerygma — sisters from{" "}
          <Link
            href={BIBLEFUNLAND_STUDIOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold/60"
          >
            Bible Funland Studios
          </Link>{" "}
          also cover the Postwick network. Use the order that fits, or just what you need.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PATH.map(({ key, label, accent, current }, index) => {
            const product = GROWTH_STACK[key];
            const connector =
              index < PATH.length - 1 ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 -right-2 z-10 hidden h-px w-4 -translate-y-1/2 bg-black/15 xl:block"
                />
              ) : null;

            if (current) {
              return (
                <div
                  key={key}
                  className="relative rounded-2xl border-2 border-gold/40 bg-white p-6 shadow-card"
                >
                  {connector}
                  <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${accent}`}>
                    {label}
                  </p>
                  <h3 className="mt-2 font-playfair text-xl italic text-near-black">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-body">{product.tagline}</p>
                  <TextureButton asChild variant="primary" size="sm" className="mt-4">
                    <Link href="/sign-up">Get started →</Link>
                  </TextureButton>
                </div>
              );
            }

            return (
              <Link
                key={key}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card transition hover:border-black/10 hover:shadow-md"
              >
                {connector}
                <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${accent}`}>
                  {label}
                </p>
                <h3 className="mt-2 font-playfair text-xl italic text-near-black">{product.name}</h3>
                <p className="mt-2 text-sm text-gray-body">{product.tagline}</p>
                <span className="mt-4 inline-block text-sm font-medium text-gold">Learn more →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
