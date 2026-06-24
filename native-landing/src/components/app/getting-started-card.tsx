"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";

const STORAGE_KEY = "postwick_onboarding_dismissed";

type SetupStep = {
  label: string;
  done: boolean;
};

export function GettingStartedCard({ steps }: { steps: SetupStep[] }) {
  const [dismissed, setDismissed] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const allComplete = steps.every((step) => step.done);

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === "true";
    setDismissed(isDismissed);
  }, []);

  useEffect(() => {
    if (dismissed || !allComplete) return;
    setShowSuccess(true);
  }, [allComplete, dismissed]);

  useEffect(() => {
    if (!showSuccess || dismissed) return;

    const timer = window.setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true");
      setDismissed(true);
      setShowSuccess(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [showSuccess, dismissed]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
    setShowSuccess(false);
  }

  if (dismissed) return null;

  return (
    <PanelCard
      title="Getting started"
      description={
        showSuccess ? undefined : "Three steps to your first autopilot post."
      }
      action={
        showSuccess ? undefined : (
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-gray-label transition hover:bg-cream/80 hover:text-near-black"
            aria-label="Dismiss getting started checklist"
          >
            Got it
            <X className="h-3.5 w-3.5" />
          </button>
        )
      }
    >
      {showSuccess ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <div className="rounded-full bg-gold/10 p-3">
            <CheckCircle2 className="h-7 w-7 text-gold" />
          </div>
          <p className="mt-4 font-playfair text-xl italic text-near-black">
            You&apos;re all set! 🎉
          </p>
        </div>
      ) : (
        <>
          <ol className="space-y-3">
            {steps.map((step) => (
              <li
                key={step.label}
                className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-cream/60 px-4 py-3 text-sm"
              >
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${step.done ? "text-gold" : "text-gray-label"}`}
                />
                <span className="text-near-black">{step.label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <TextureButton asChild variant="primary" size="default">
              <Link href="/queue">Review posts</Link>
            </TextureButton>
            <TextureButton asChild variant="secondary" size="default">
              <Link href="/settings/integrations">Connect channels</Link>
            </TextureButton>
          </div>
        </>
      )}
    </PanelCard>
  );
}
