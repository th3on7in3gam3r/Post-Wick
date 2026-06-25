"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, Loader2, Sparkles } from "lucide-react";
import { BrandVoiceEditor } from "@/components/app/brand-voice-editor";
import { TextureButton } from "@/components/ui/texture-button";
import {
  brandVoiceFromResearch,
  type BrandResearchRecord,
  type BrandVoiceForm,
} from "@/lib/brand-voice";
import { clearPendingWebsiteUrl, consumePendingWebsiteUrl, consumeHeroOnboardingIntent } from "@/lib/pending-website-url";
import { normalizeWebsiteUrl } from "@/lib/website-url";

type Step = "idle" | "analyzing" | "review" | "generating" | "done" | "error";

const PROGRESS_STEPS = [
  { id: "crawling", label: "Crawling your website" },
  { id: "research", label: "Building your brand profile" },
  { id: "review", label: "Review your brand voice" },
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
  const [step, setStep] = useState<Step>(websiteUrl ? "analyzing" : "idle");
  const [workingPhase, setWorkingPhase] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [voiceDraft, setVoiceDraft] = useState<BrandVoiceForm | null>(null);
  const [crawledPages, setCrawledPages] = useState(0);
  const [result, setResult] = useState<{
    brandId: string;
    postCount: number;
    crawledPages: number;
    imageHint?: string | null;
  } | null>(null);
  const phaseTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isAnalyzing = step === "analyzing";
  const isGenerating = step === "generating";
  const isBusy = isAnalyzing || isGenerating;

  function clearPhaseTimers() {
    for (const timer of phaseTimersRef.current) {
      clearTimeout(timer);
    }
    phaseTimersRef.current = [];
  }

  function beginAnalyzePhases() {
    clearPhaseTimers();
    setWorkingPhase(0);
    phaseTimersRef.current = [setTimeout(() => setWorkingPhase(1), 7_000)];
  }

  function beginGeneratePhases() {
    clearPhaseTimers();
    setWorkingPhase(3);
  }

  async function analyzeWebsite(targetUrl?: string) {
    const value = (targetUrl ?? url).trim();
    if (!value) {
      setError("Enter your website URL to continue.");
      return;
    }

    setError(null);
    setStatusNote(null);
    setResult(null);
    setBrandId(null);
    setVoiceDraft(null);
    setStep("analyzing");
    beginAnalyzePhases();

    try {
      const response = await fetch("/api/brands/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: value,
          name: brandName ?? undefined,
          analyzeOnly: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(parseApiError(data));
      }

      clearPhaseTimers();

      if (data.created === false) {
        setStatusNote("This website was already set up. Opening your brand…");
        setStep("done");
        window.setTimeout(() => {
          router.push(`/brands/${data.brand.id}`);
          router.refresh();
        }, 1200);
        return;
      }

      setBrandId(data.brand.id);
      setCrawledPages(data.crawledPages ?? 0);
      setVoiceDraft(
        brandVoiceFromResearch((data.brand.researchData ?? {}) as BrandResearchRecord),
      );
      setWorkingPhase(2);
      setStep("review");
    } catch (err) {
      clearPhaseTimers();
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function confirmBrandVoice() {
    if (!brandId || !voiceDraft) return;

    setError(null);
    setStatusNote(null);
    setStep("generating");
    beginGeneratePhases();

    try {
      const response = await fetch(`/api/brands/${brandId}/confirm-voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voiceDraft),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(parseApiError(data));
      }

      setResult({
        brandId: data.brand.id,
        postCount: data.posts?.length ?? 0,
        crawledPages,
        imageHint: data.imageHint ?? null,
      });
      setStep("done");

      if (data.imageHint) {
        setStatusNote(data.imageHint);
      }

      window.setTimeout(() => {
        router.push(
          addingAnother ? `/brands/${data.brand.id}` : `/dashboard?brand=${data.brand.id}`,
        );
        router.refresh();
      }, 1600);
    } catch (err) {
      setStep("review");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleChangeUrl() {
    if (brandId) {
      await fetch(`/api/brands/${brandId}`, { method: "DELETE" }).catch(() => undefined);
    }

    clearPhaseTimers();
    setBrandId(null);
    setVoiceDraft(null);
    setResult(null);
    setStatusNote(null);
    setError(null);
    setWorkingPhase(0);
    setStep("idle");
  }

  useEffect(() => {
    if (addingAnother) {
      if (!consumeHeroOnboardingIntent()) {
        return () => clearPhaseTimers();
      }

      const stored = consumePendingWebsiteUrl();
      const normalized = stored ? normalizeWebsiteUrl(stored) : null;
      if (normalized) {
        setUrl(normalized);
        void analyzeWebsite(normalized);
      }

      return () => clearPhaseTimers();
    }

    if (websiteUrl) {
      consumeHeroOnboardingIntent();
      clearPendingWebsiteUrl();
      void analyzeWebsite(websiteUrl);
      return () => clearPhaseTimers();
    }

    if (!consumeHeroOnboardingIntent()) {
      return () => clearPhaseTimers();
    }

    const stored = consumePendingWebsiteUrl();
    const normalized = stored ? normalizeWebsiteUrl(stored) : null;
    if (normalized) {
      setUrl(normalized);
      void analyzeWebsite(normalized);
    }

    return () => clearPhaseTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl, addingAnother]);

  const activeIndex =
    step === "done"
      ? PROGRESS_STEPS.length
      : step === "review"
        ? 2
        : step === "generating"
          ? 3
          : step === "analyzing"
            ? workingPhase
            : -1;

  const showProgressList = step !== "review";

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card">
        {step !== "review" ? (
          <>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-cream p-3">
                {isBusy ? (
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
                  {isAnalyzing
                    ? "Hang tight — we're learning your business."
                    : isGenerating
                      ? "Drafting your first posts from the brand voice you approved."
                      : addingAnother
                        ? "Enter a new website URL to crawl and review your brand voice."
                        : "We'll crawl your site, confirm your brand voice, then draft posts."}
                </p>
              </div>
            </div>

            {!websiteUrl && step === "idle" ? (
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-near-black">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://yourbusiness.com"
                  disabled={isBusy}
                  className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm outline-none ring-gold/30 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !isBusy) {
                      event.preventDefault();
                      void analyzeWebsite();
                    }
                  }}
                />
                <TextureButton
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={() => void analyzeWebsite()}
                  disabled={isBusy}
                  className="w-full"
                >
                  Analyze my website
                </TextureButton>
              </div>
            ) : null}

            {isAnalyzing ? (
              <div
                className="mt-6 rounded-xl border border-gold/25 bg-cream/70 px-4 py-3 text-sm text-gray-body"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium text-near-black">
                  {PROGRESS_STEPS[workingPhase]?.label ?? "Finishing up"}…
                </p>
                <p className="mt-1 text-xs">
                  First run can take a minute while we crawl pages and build your brand
                  profile.
                </p>
              </div>
            ) : null}

            {isGenerating ? (
              <div
                className="mt-6 rounded-xl border border-gold/25 bg-cream/70 px-4 py-3 text-sm text-gray-body"
                role="status"
                aria-live="polite"
              >
                <p className="font-medium text-near-black">Generating your first posts…</p>
                <p className="mt-1 text-xs">
                  This can take 1–2 minutes while we draft LinkedIn and Instagram posts.
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        {step === "review" && voiceDraft ? (
          <BrandVoiceEditor
            value={voiceDraft}
            onChange={setVoiceDraft}
            onConfirm={() => void confirmBrandVoice()}
            onBack={() => void handleChangeUrl()}
            confirming={false}
            websiteUrl={url}
          />
        ) : null}

        {showProgressList ? (
          <ol className="mt-8 space-y-3">
            {PROGRESS_STEPS.map((item, index) => {
              const complete = index < activeIndex;
              const active =
                (step === "analyzing" && index === workingPhase) ||
                (step === "generating" && item.id === "posts");
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
        ) : null}

        {result ? (
          <p className="mt-6 text-sm text-gray-body" role="status">
            Crawled {result.crawledPages} pages and created {result.postCount} draft posts.
            Redirecting{addingAnother ? " to your brand" : " to your dashboard"}…
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
                if (step === "review") {
                  setError(null);
                  return;
                }
                setStep("idle");
                setError(null);
              }}
            >
              {step === "review" ? "Dismiss" : "Try again"}
            </TextureButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
