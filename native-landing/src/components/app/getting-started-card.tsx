"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { PanelCard } from "@/components/app/panel-card";
import { TextureButton } from "@/components/ui/texture-button";

const STORAGE_KEY = "postwick_onboarding_dismissed";

type SetupStep = {
  label: string;
  done: boolean;
};

export function GettingStartedCard({ steps }: { steps: SetupStep[] }) {
  const [dismissed, setDismissed] = useState(false);
  const allComplete = steps.every((step) => step.done);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  if (dismissed && allComplete) return null;

  if (allComplete) {
    return (
      <PanelCard title="Getting started">
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-gold/10 p-3">
            <CheckCircle2 className="h-7 w-7 text-gold" />
          </div>
          <p className="mt-4 font-playfair text-xl italic text-near-black">
            You&apos;re all set! Your autopilot is running.
          </p>
          <TextureButton
            type="button"
            variant="secondary"
            size="sm"
            className="mt-5"
            onClick={dismiss}
          >
            Got it
          </TextureButton>
        </div>
      </PanelCard>
    );
  }

  return (
    <PanelCard
      title="Getting started"
      description="Three steps to your first autopilot post."
    >
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
    </PanelCard>
  );
}
