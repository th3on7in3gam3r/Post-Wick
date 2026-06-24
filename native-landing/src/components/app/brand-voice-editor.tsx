"use client";

import { Loader2 } from "lucide-react";
import { TagInput } from "@/components/app/tag-input";
import { TextureButton } from "@/components/ui/texture-button";
import { INDUSTRY_OPTIONS, type BrandVoiceForm } from "@/lib/brand-voice";

type BrandVoiceEditorProps = {
  value: BrandVoiceForm;
  onChange: (value: BrandVoiceForm) => void;
  onConfirm: () => void;
  onBack: () => void;
  confirming?: boolean;
  websiteUrl?: string | null;
};

const fieldClassName =
  "w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm text-near-black outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

export function BrandVoiceEditor({
  value,
  onChange,
  onConfirm,
  onBack,
  confirming = false,
  websiteUrl,
}: BrandVoiceEditorProps) {
  function update<K extends keyof BrandVoiceForm>(key: K, next: BrandVoiceForm[K]) {
    onChange({ ...value, [key]: next });
  }

  const canConfirm =
    value.companyName.trim().length > 0 &&
    value.industry.trim().length > 0 &&
    value.tone.trim().length > 0 &&
    value.keyTopics.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="step-label">Brand voice</p>
        <h3 className="mt-2 font-playfair text-[clamp(1.5rem,3vw,2rem)] italic text-near-black">
          Does this sound like you?
        </h3>
        <p className="body-copy mt-2 text-sm">
          We pulled this from your website{websiteUrl ? ` (${websiteUrl})` : ""}. Edit anything
          before we draft your first posts.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="brand-name" className="block text-sm font-medium text-near-black">
            Business name
          </label>
          <input
            id="brand-name"
            type="text"
            value={value.companyName}
            disabled={confirming}
            onChange={(event) => update("companyName", event.target.value)}
            className={`${fieldClassName} mt-2`}
          />
        </div>

        <div>
          <label htmlFor="brand-industry" className="block text-sm font-medium text-near-black">
            Industry
          </label>
          <input
            id="brand-industry"
            type="text"
            list="brand-industry-options"
            value={value.industry}
            disabled={confirming}
            onChange={(event) => update("industry", event.target.value)}
            className={`${fieldClassName} mt-2`}
          />
          <datalist id="brand-industry-options">
            {INDUSTRY_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="brand-tone" className="block text-sm font-medium text-near-black">
            Tone / voice
          </label>
          <p className="mt-1 text-xs text-gray-label">
            A short label for how you sound — e.g. &ldquo;Warm and grounded&rdquo;
          </p>
          <input
            id="brand-tone"
            type="text"
            value={value.tone}
            disabled={confirming}
            onChange={(event) => update("tone", event.target.value)}
            placeholder="Warm and grounded"
            className={`${fieldClassName} mt-2`}
          />
          <label htmlFor="brand-voice-description" className="sr-only">
            Voice description
          </label>
          <textarea
            id="brand-voice-description"
            value={value.voiceDescription}
            disabled={confirming}
            onChange={(event) => update("voiceDescription", event.target.value)}
            rows={3}
            placeholder="A sentence or two on how you want to come across — friendly expert, calm guide, playful neighbor…"
            className={`${fieldClassName} mt-3 resize-none`}
          />
        </div>

        <TagInput
          id="brand-key-themes"
          label="Key themes"
          hint="Topics and angles we should weave into your posts."
          tags={value.keyTopics}
          onChange={(tags) => update("keyTopics", tags)}
          placeholder="Seasonal promos, behind the scenes…"
          disabled={confirming}
        />

        <TagInput
          id="brand-things-to-avoid"
          label="Things to avoid"
          hint="Phrases, topics, or vibes that are off-brand."
          tags={value.thingsToAvoid}
          onChange={(tags) => update("thingsToAvoid", tags)}
          placeholder="Hard sales pitches, jargon…"
          disabled={confirming}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-6">
        <TextureButton
          type="button"
          variant="primary"
          size="lg"
          onClick={onConfirm}
          disabled={!canConfirm || confirming}
          className="w-full"
        >
          {confirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating your posts…
            </>
          ) : (
            "Looks right, generate my posts →"
          )}
        </TextureButton>
        <button
          type="button"
          onClick={onBack}
          disabled={confirming}
          className="text-sm font-medium text-gray-body transition hover:text-near-black disabled:opacity-60"
        >
          ← Change my URL
        </button>
      </div>
    </div>
  );
}
