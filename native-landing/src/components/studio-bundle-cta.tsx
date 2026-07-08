import Link from "next/link";
import { ExternalLink, Layers } from "lucide-react";
import { aiCmoStudioBillingUrl, aiCmoStudioHubUrl } from "@/lib/growth-stack";

export function StudioBundleCta() {
  return (
    <section className="border-y border-black/[0.06] bg-gradient-to-b from-[#F5F0FF] to-cream-dark px-10 py-16">
      <div className="mx-auto max-w-[900px] text-center">
        <p className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-plum">
          <Layers className="h-3.5 w-3.5" aria-hidden />
          Bible Funland studio bundles
        </p>
        <h2 className="mt-3 font-playfair text-[clamp(1.5rem,3vw,2.25rem)] italic text-plum">
          Need strategy &amp; citations too?
        </h2>
        <p className="body-copy mx-auto mt-3 max-w-xl text-gray-body">
          Subscribe to the <strong>Social Stack</strong> or full <strong>Studio Bundle</strong> through
          AI CMO — one Stripe bill, Kerygma Pro included. Already on Kerygma? Link the same email in
          AI CMO Settings → Studio after checkout.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={aiCmoStudioBillingUrl("social")}
            className="inline-flex items-center gap-2 rounded-full bg-plum px-6 py-3 text-sm font-semibold text-cream shadow-card transition hover:bg-plum/90"
          >
            Social Stack — from $29/mo
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={aiCmoStudioBillingUrl("studio")}
            className="inline-flex items-center gap-2 rounded-full border-2 border-plum/30 bg-white px-6 py-3 text-sm font-semibold text-plum transition hover:border-plum/50"
          >
            Studio Bundle — all four products
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href={aiCmoStudioHubUrl()}
            className="text-sm font-medium text-gray-body underline decoration-plum/30 underline-offset-4 hover:text-plum"
          >
            Compare the full stack
          </Link>
        </div>
      </div>
    </section>
  );
}
