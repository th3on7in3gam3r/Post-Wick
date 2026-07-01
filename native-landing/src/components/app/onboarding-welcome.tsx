"use client";

import { useState, type FormEvent } from "react";
import { Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { REFERRAL_SOURCES } from "@/lib/onboarding/referral-sources";

export function OnboardingWelcome({
  initialName,
  initialEmail,
  onComplete,
}: {
  initialName: string | null;
  initialEmail: string | null;
  onComplete: () => void;
}) {
  const [displayName, setDisplayName] = useState(initialName ?? "");
  const [referralSource, setReferralSource] = useState("");
  const [referralDetail, setReferralDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!referralSource) {
      setError("Please tell us where you heard about Kerygma Social.");
      return;
    }

    if (referralSource === "other" && !referralDetail.trim()) {
      setError("Please tell us where you heard about us.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim() || undefined,
          referralSource,
          referralDetail: referralDetail.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Could not save your profile.",
        );
      }

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-cream p-3">
          <Sparkles className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h2 className="font-playfair text-2xl italic text-near-black">
            Welcome to Kerygma Social
          </h2>
          <p className="text-sm text-gray-body">
            A quick hello before we learn your brand and draft your first posts.
          </p>
        </div>
      </div>

      {initialEmail ? (
        <p className="rounded-xl border border-black/[0.06] bg-cream/50 px-4 py-3 text-sm text-gray-body">
          Signed in as <span className="font-medium text-near-black">{initialEmail}</span>
        </p>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm font-medium text-near-black" htmlFor="onboarding-name">
          Your name
        </label>
        <input
          id="onboarding-name"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="How should we address you?"
          disabled={submitting}
          className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-near-black" htmlFor="referral-source">
          Where did you hear about us?
        </label>
        <select
          id="referral-source"
          value={referralSource}
          onChange={(event) => setReferralSource(event.target.value)}
          disabled={submitting}
          className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm text-near-black outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">Select one…</option>
          {REFERRAL_SOURCES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {referralSource === "other" ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-near-black" htmlFor="referral-detail">
            Please specify
          </label>
          <input
            id="referral-detail"
            type="text"
            value={referralDetail}
            onChange={(event) => setReferralDetail(event.target.value)}
            placeholder="Podcast name, referral, event, etc."
            disabled={submitting}
            className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <TextureButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-full"
      >
        {submitting ? "Saving…" : "Continue to brand setup"}
      </TextureButton>
    </form>
  );
}
