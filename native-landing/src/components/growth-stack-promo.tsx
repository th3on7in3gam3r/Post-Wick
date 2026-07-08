import Link from "next/link";
import { BIBLEFUNLAND_STUDIOS_URL, GROWTH_STACK, aiCmoAppHref } from "@/lib/growth-stack";
import { TextureButton } from "@/components/ui/texture-button";

const SISTERS = [
  { key: "citePilot" as const, accent: "text-gold" },
  { key: "aiCmo" as const, accent: "text-[#5B4FCF]" },
  { key: "aegis" as const, accent: "text-[#2D6A4F]" },
];

export function GrowthStackPromo() {
  return (
    <section className="bg-cream-dark px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="step-label">Growth stack</p>
        <h2 className="mt-2 max-w-2xl font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          Social is one piece — citations, strategy, and security too
        </h2>
        <p className="body-copy mt-3 max-w-2xl">
          Kerygma Social publishes for you. Sister products from{" "}
          <Link
            href={BIBLEFUNLAND_STUDIOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold/60"
          >
            Bible Funland Studios
          </Link>{" "}
          cover AI visibility, marketing war room, and dev security — use what fits.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border-2 border-gold/40 bg-white p-6 shadow-card">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold">
              You are here
            </p>
            <h3 className="mt-2 font-playfair text-xl italic text-near-black">
              {GROWTH_STACK.kerygma.name}
            </h3>
            <p className="mt-2 text-sm text-gray-body">{GROWTH_STACK.kerygma.tagline}</p>
            <TextureButton asChild variant="primary" size="sm" className="mt-4">
              <Link href="/sign-up">Get started →</Link>
            </TextureButton>
          </div>

          {SISTERS.map(({ key, accent }) => {
            const product = GROWTH_STACK[key];
            const href = "href" in product ? product.href : aiCmoAppHref();
            return (
              <Link
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-card transition hover:border-black/10 hover:shadow-md"
              >
                <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${accent}`}>
                  Sister product
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
