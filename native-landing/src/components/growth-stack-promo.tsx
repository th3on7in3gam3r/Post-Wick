import Link from "next/link";
import { BIBLEFUNLAND_STUDIOS_URL } from "@/lib/growth-stack";
import { GrowthStackTabs } from "@/components/growth-stack-tabs";

export function GrowthStackPromo() {
  return (
    <section className="bg-cream-dark px-6 py-20 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        <p className="step-label">Growth stack</p>
        <h2 className="mt-2 max-w-2xl font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
          One stack — citations, content, strategy, security, social, discovery
        </h2>
        <p className="body-copy mt-3 max-w-2xl">
          Sister tools from{" "}
          <Link
            href={BIBLEFUNLAND_STUDIOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold/60"
          >
            Bible Funland Studios
          </Link>
          . A simple path runs CitePilot → SignalDesk → Cadence → Aegis → Kerygma → Postwick —
          follow it, or open only what you need.
        </p>

        <GrowthStackTabs />
      </div>
    </section>
  );
}
