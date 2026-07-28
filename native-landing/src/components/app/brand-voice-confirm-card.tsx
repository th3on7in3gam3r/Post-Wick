"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandVoiceEditor } from "@/components/app/brand-voice-editor";
import {
  brandVoiceFromResearch,
  type BrandResearchRecord,
  type BrandVoiceForm,
} from "@/lib/brand-voice";

function parseConfirmError(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Failed to confirm brand voice";
  }
  const error = (data as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return "Check the brand voice fields and try again.";
  }
  return "Failed to confirm brand voice";
}

export function BrandVoiceConfirmCard({
  brandId,
  websiteUrl,
  research,
}: {
  brandId: string;
  websiteUrl: string;
  research: BrandResearchRecord | null;
}) {
  const router = useRouter();
  const [voiceDraft, setVoiceDraft] = useState<BrandVoiceForm>(() =>
    brandVoiceFromResearch(research ?? {}),
  );
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmBrandVoice() {
    setError(null);
    setConfirming(true);

    try {
      const response = await fetch(`/api/brands/${brandId}/confirm-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voiceDraft),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(parseConfirmError(data));
      }

      router.refresh();
      router.push("/settings/integrations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setConfirming(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-card sm:p-6">
      <div className="mb-5 rounded-xl border border-amber-200/80 bg-white/70 px-4 py-3 text-sm text-amber-950">
        <p className="font-medium">Brand voice review is still open</p>
        <p className="mt-1 text-amber-900/85">
          Confirm your brand voice here to finish setup. Approving drafts in the queue does not
          unlock Postwick — this step does.
        </p>
      </div>

      <BrandVoiceEditor
        value={voiceDraft}
        onChange={setVoiceDraft}
        onConfirm={() => void confirmBrandVoice()}
        confirming={confirming}
        websiteUrl={websiteUrl}
        description={`We pulled this from your website (${websiteUrl}). Confirm it to finish brand setup and unlock Postwick connect.`}
        confirmLabel="Confirm brand voice →"
        backLabel="← Back to Network"
        onBack={() => router.push("/settings/integrations")}
      />

      {error ? (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
