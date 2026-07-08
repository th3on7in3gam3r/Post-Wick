"use client";

import { GeneratePostsButton } from "@/components/app/generate-posts-button";
import { BrandProfileEditor } from "@/components/app/brand-profile-editor";
import { brandProfileFromResearch } from "@/lib/brand-voice";
import type { BrandResearchRecord } from "@/lib/brand-voice";

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
  connectedPlatforms = [],
  research,
}: {
  brandId: string;
  generateMax: number;
  connectedPlatforms?: string[];
  research: BrandResearchRecord | null;
}) {
  const profile = research ? brandProfileFromResearch(research) : null;

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
              connectedPlatforms={connectedPlatforms}
              layout="toolbar"
            />
          </div>
        </div>

        {research && profile ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {research.source ? (
                <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-3">
                  <ProfileField label="Research source" value={String(research.source)} />
                </div>
              ) : null}
              {research.industry ? (
                <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-3">
                  <ProfileField label="Industry" value={String(research.industry)} />
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-black/[0.06] bg-cream/25 px-4 py-4">
              <BrandProfileEditor brandId={brandId} initialProfile={profile} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-body">No research data yet.</p>
        )}
      </div>
    </section>
  );
}
