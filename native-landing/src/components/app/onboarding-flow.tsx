"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, Loader2, Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";

type Step = "idle" | "crawling" | "research" | "posts" | "done" | "error";

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
  const [step, setStep] = useState<Step>(websiteUrl ? "idle" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    brandId: string;
    postCount: number;
    crawledPages: number;
  } | null>(null);

  async function startSetup(targetUrl?: string) {
    const value = (targetUrl ?? url).trim();
    if (!value) {
      setError("Enter your website URL to continue.");
      return;
    }

    setError(null);
    setStep("crawling");

    try {
      setStep("research");
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
        throw new Error(data.error ?? "Failed to set up brand");
      }

      setStep("posts");
      setResult({
        brandId: data.brand.id,
        postCount: data.posts?.length ?? 0,
        crawledPages: data.crawledPages ?? 0,
      });
      setStep("done");

      window.setTimeout(() => {
        router.push(
          addingAnother ? `/brands/${data.brand.id}` : `/dashboard?brand=${data.brand.id}`,
        );
        router.refresh();
      }, 1200);
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  useEffect(() => {
    if (websiteUrl) {
      void startSetup(websiteUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteUrl]);

  const steps = [
    { id: "crawling", label: "Crawling your website" },
    { id: "research", label: "Building your brand profile" },
    { id: "posts", label: "Generating your first posts" },
  ];

  const activeIndex =
    step === "crawling" ? 0 : step === "research" ? 1 : step === "posts" || step === "done" ? 2 : -1;

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-cream p-3">
            <Globe className="h-5 w-5 text-gold" />
          </div>
          <div>
            <h2 className="font-playfair text-2xl italic text-near-black">
              {addingAnother ? "Add another brand" : "Set up your brand"}
            </h2>
            <p className="text-sm text-gray-body">
              {addingAnother
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
              className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3 text-sm outline-none ring-gold/30 focus:ring-2"
            />
            <TextureButton
              type="button"
              variant="primary"
              size="lg"
              onClick={() => void startSetup()}
              disabled={step !== "idle" && step !== "error"}
            >
              Analyze my website
            </TextureButton>
          </div>
        ) : null}

        <ol className="mt-8 space-y-3">
          {steps.map((item, index) => {
            const complete = step === "done" || index < activeIndex;
            const active = index === activeIndex && step !== "done" && step !== "error";
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-black/[0.06] bg-cream/50 px-4 py-3 text-sm"
              >
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 text-gold" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                ) : (
                  <Sparkles className="h-4 w-4 text-gray-label" />
                )}
                <span className="text-near-black">{item.label}</span>
              </li>
            );
          })}
        </ol>

        {result ? (
          <p className="mt-6 text-sm text-gray-body">
            Crawled {result.crawledPages} pages and created {result.postCount} draft
            posts. Redirecting{addingAnother ? " to your brand" : " to your dashboard"}…
          </p>
        ) : null}

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
