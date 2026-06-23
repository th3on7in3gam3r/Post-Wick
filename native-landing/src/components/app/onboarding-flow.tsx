"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, Loader2, Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

type Step = "idle" | "working" | "done" | "error";

const PROGRESS_STEPS = [
  { id: "crawling", label: "Crawling your website" },
  { id: "research", label: "Building your brand profile" },
  { id: "posts", label: "Generating your first posts" },
] as const;

function parseApiError(data: unknown) {
  if (!data || typeof data !== "object") {
    return "Failed to set up brand";
  }
  const error = (data as { error?: unknown }).error;
  if (typeof error === "string") return error;
  if (Array.isArray(error)) {
    return "Invalid website URL. Try including https:// or use yourcompany.com.";
  }
  return "Failed to set up brand";
}

export function OnboardingFlow({
  websiteUrl,
  brandName,
  addingAnother = false,
}: {
  websiteUrl: string | null;
  brandName: string | null;
  addingAnother?: boolean;
}) {
  const router = useRouter();
  const [url, setUrl] = useState(websiteUrl ?? "");
  const [step, setStep] = useState<Step>(websiteUrl ? "working" : "idle");
  const [workingPhase, setWorkingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [result, setResult] = useState<{
    brandId: string;
    postCount: number;
    crawledPages: number;
    imageHint?: string | null;
  } | null>(null);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isWorking = step === "working";

  function clearPhaseTimers() {
    for (const timer of phaseTimersRef.current) {
      clearTimeout(timer);
    }
    phaseTimersRef.current = [];
  }

  function beginWorkingPhases() {
    clearPhaseTimers();
    setWorkingPhase(0);
    phaseTimersRef.current = [
      setTimeout(() => setWorkingPhase(1), 7_000),
      setTimeout(() => setWorkingPhase(2), 18_000),
    ];
  }

  async function startSetup(targetUrl?: string) {
    const value = (targetUrl ?? url).trim();
    if (!value) {
      setError("Enter your website URL to continue.");
      return;
    }

    setError(null);
    setStatusNote(null);
    setResult(null);
    setStep("working");
    beginWorkingPhases();

    try {
      const response = await fetch("/api/brands/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: value,
          name: brandName ?? undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(parseApiError(data));
      }

      clearPhaseTimers();
      setWorkingPhase(2);
      setResult({
        brandId: data.brand.id,
        postCount: data.posts?.length ?? 0,
        crawledPages: data.crawledPages ?? 0,
        imageHint: data.imageHint ?? null,
      });
      setStep("done");

      if (data.created === false) {
        setStatusNote("This website was already set up. Opening your brand…");
      } else if (data.imageHint) {
        setStatusNote(data.imageHint);
      }

      window.setTimeout(() => {
        router.push(
          addingAnother ? `/brands/${data.brand.id}` : `/dashboard?brand=${data.brand.id}`,
        );
        router.refresh();
      }, 1600);
    } catch (err) {
      clearPhaseTimers();
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  useEffect(() => {
    if (websiteUrl) {
      void startSetup(websiteUrl);
    }
    return () => clearPhaseTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl]);

  const activeIndex =
    step === "done"
      ? PROGRESS_STEPS.length
      : step === "working"
        ? workingPhase
        : -1;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cream p-3">
            {isWorking ? (
              <Loader2 className="h-5 w-5 animate-spin text-gold" />
            ) : (
              <Globe className="h-5 w-5 text-gold" />
            )}
          </div>
          <div>
            <h2 className="font-playfair text-2xl italic text-near-black">
              {addingAnother ? "Add another brand" : "Set up your brand"}
            </h2>
            <p className="text-sm text-gray-body">
              {isWorking
                ? "Hang tight — autopilot is learning your business."
                : addingAnother
                  ? "Enter a new website URL to crawl and generate posts."
                  : "We'll crawl your site and draft your first posts."}
            </p>
          </div>
        </div>

        {!websiteUrl ? (
          <div className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-near-black">
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://yourbusiness.com"
              disabled={isWorking}
              className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isWorking) {
                  event.preventDefault();
                  void startSetup();
                }
              }}
            />
            <TextureButton
              type="button"
              variant="primary"
              size="lg"
              onClick={() => void startSetup()}
              disabled={isWorking}
              className="w-full"
            >
              {isWorking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing your website…
                </>
              ) : (
                "Analyze my website"
              )}
            </TextureButton>
          </div>
        ) : null}

        {isWorking ? (
          <div
            className="mt-6 rounded-xl border border-gold/25 bg-cream/70 px-4 py-3 text-sm text-gray-body"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium text-near-black">
              {PROGRESS_STEPS[workingPhase]?.label ?? "Finishing up"}…
            </p>
            <p className="mt-1 text-xs">
              First run can take 1–3 minutes while we crawl pages, write your brand
              profile, and draft posts.
            </p>
          </div>
        ) : null}

        <ol className="mt-8 space-y-3">
          {PROGRESS_STEPS.map((item, index) => {
            const complete = index < activeIndex;
            const active = step === "working" && index === workingPhase;
            return (
              <li
                key={item.id}
                className={[
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  active
                    ? "border-gold/30 bg-cream"
                    : "border-black/[0.06] bg-cream/50",
                ].join(" ")}
              >
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gold" />
                ) : (
                  <Sparkles className="h-4 w-4 shrink-0 text-gray-label" />
                )}
                <span className={active ? "font-medium text-near-black" : "text-near-black"}>
                  {item.label}
                  {active ? "…" : ""}
                </span>
              </li>
            );
          })}
        </ol>

        {result ? (
          <p className="mt-6 text-sm text-gray-body" role="status">
            Crawled {result.crawledPages} pages and created {result.postCount} draft
            posts. Redirecting{addingAnother ? " to your brand" : " to your dashboard"}…
          </p>
        ) : null}

        {statusNote && step === "done" ? (
          <p className="mt-2 text-xs text-gray-label">{statusNote}</p>
        ) : null}

        {error ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
            <TextureButton
              type="button"
              variant="secondary"
              size="default"
              onClick={() => {
                setStep("idle");
                setError(null);
              }}
            >
              Try again
            </TextureButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
