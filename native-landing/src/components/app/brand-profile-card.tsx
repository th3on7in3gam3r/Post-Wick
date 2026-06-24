"use client";

import { GeneratePostsButton } from "@/components/app/generate-posts-button";

type BrandResearch = {
  source?: string;
  industry?: string;
  tone?: string;
  uniqueValueProposition?: string;
  keyTopics?: string[];
};

function ProfileField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
        {label}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-near-black">{value}</p>
    </div>
  );
}

export function BrandProfileCard({
  brandId,
  generateMax,
  research,
}: {
  brandId: string;
  generateMax: number;
  research: BrandResearch | null;
}) {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-black/[0.06] bg-white shadow-card">
      <div className="border-b border-black/[0.06] px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="font-playfair text-xl italic leading-snug text-near-black">
          Brand profile
        </h2>
        <p className="mt-1 text-sm text-gray-body">Built from your website crawl.</p>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
        <div className="rounded-xl border border-black/[0.06] bg-gradient-to-br from-cream/80 to-cream/30 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
            Generate posts
          </p>
          <div className="mt-3">
            <GeneratePostsButton
              brandId={brandId}
              generateMax={generateMax}
              layout="toolbar"
            />
          </div>
        </div>

        {research ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {research.source ? (
                <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-3">
                  <ProfileField label="Research source" value={String(research.source)} />
                </div>
              ) : null}
              {research.industry ? (
                <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-3">
                  <ProfileField label="Industry" value={research.industry} />
                </div>
              ) : null}
            </div>

            {research.tone ? (
              <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-3">
                <ProfileField label="Tone" value={research.tone} />
              </div>
            ) : null}

            {research.uniqueValueProposition ? (
              <div className="rounded-xl border border-gold/15 bg-gold/[0.04] px-4 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
                  Value proposition
                </p>
                <p className="mt-2 font-playfair text-base italic leading-relaxed text-near-black">
                  {research.uniqueValueProposition}
                </p>
              </div>
            ) : null}

            {research.keyTopics && research.keyTopics.length > 0 ? (
              <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-gray-label">
                  Key topics
                </p>
                <div className="mt-3 flex max-h-36 flex-wrap gap-2 overflow-y-auto pr-1">
                  {research.keyTopics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-black/[0.06] bg-white px-3 py-1 text-xs font-medium text-near-black"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-gray-body">No research data yet.</p>
        )}
      </div>
    </section>
  );
}
