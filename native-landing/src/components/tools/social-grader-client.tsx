"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { BarChart3, Sparkles } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import { SocialGraderLoader } from "@/components/tools/social-grader-loader";
import {
  gradeSocialPresence,
  graderSignUpHref,
  type SocialGradeResult,
} from "@/lib/tools/social-grader";
import { cn } from "@/lib/utils";

type Step = "input" | "loading" | "results";

const FROST_CARD_HERO =
  "mx-auto max-w-3xl rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm md:p-12";
const FROST_CARD = "rounded-2xl bg-white/80 p-8 shadow-lg backdrop-blur-sm";

const LOADING_MESSAGES = [
  "Scanning your public presence…",
  "Checking posting patterns…",
  "Comparing to similar businesses…",
] as const;

export function SocialGraderClient() {
  const [step, setStep] = useState<Step>("input");
  const [input, setInput] = useState("");
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [result, setResult] = useState<SocialGradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (step !== "loading") return;

    let index = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);

    const interval = window.setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]!);
    }, 900);

    const timeout = window.setTimeout(() => {
      try {
        setResult(gradeSocialPresence(input));
        setStep("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not grade this input.");
        setStep("input");
      }
    }, 2200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [step, input]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      gradeSocialPresence(input);
      setStep("loading");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enter a valid URL or handle.");
    }
  }

  function handleReset() {
    setStep("input");
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-center">
        <span className="animate-fade-drop inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-near-black shadow-sm">
          Free tool
        </span>
        <div
          className={cn(
            "animate-fade-drop-delay-1 mt-6 space-y-4 text-left sm:text-center",
            FROST_CARD_HERO,
          )}
        >
          <h1 className="font-playfair text-[clamp(2rem,3.8vw,2.75rem)] italic leading-tight text-gray-900">
            Free Social Media Grader: Analyze Your Local Business Presence
          </h1>
          <p className="mx-auto max-w-[600px] text-[1.05rem] leading-relaxed text-gray-900 sm:text-center">
            Enter your website or social handle for an instant score, category breakdown, and
            practical tips to strengthen your local brand online.
          </p>
        </div>
      </div>

      <div className="animate-fade-drop-delay-3 mt-12 rounded-3xl border border-black/[0.06] bg-white p-8 shadow-card md:p-10">
        {step === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-near-black" htmlFor="grader-input">
              Website or social handle
            </label>
            <input
              id="grader-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="yourbusiness.com or @yourhandle"
              className="w-full rounded-xl border border-black/[0.1] bg-cream/50 px-4 py-3.5 text-sm text-near-black outline-none ring-gold/30 placeholder:text-gray-label focus:ring-2"
            />
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <TextureButton type="submit" variant="primary" size="lg" className="w-full">
              Grade my social presence
            </TextureButton>
          </form>
        ) : null}

        {step === "loading" ? (
          <SocialGraderLoader message={loadingMessage} />
        ) : null}

        {step === "results" && result ? (
          <div className="space-y-8">
            <div className="flex flex-col items-center text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-label">
                Your score
              </p>
              <p className="mt-2 font-playfair text-6xl italic text-gold">{result.score}</p>
              <p className="mt-1 text-sm text-gray-body">
                Grade <span className="font-medium text-near-black">{result.grade}</span> for{" "}
                <span className="font-medium text-near-black">{result.input}</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-near-black">
                <BarChart3 className="h-4 w-4 text-gold" />
                Breakdown
              </div>
              {result.breakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-gray-body">{item.label}</span>
                    <span className="font-medium text-near-black">{item.score}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-gold transition-all"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gold/20 bg-cream/60 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-near-black">
                <Sparkles className="h-4 w-4 text-gold" />
                Top opportunities
              </div>
              <ul className="mt-4 space-y-3 text-sm text-gray-body">
                {result.tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-near-black px-6 py-6 text-center text-white">
              <p className="font-playfair text-2xl italic">Put your feed on autopilot</p>
              <p className="mt-2 text-sm text-white/75">
                Kerygma Social researches your brand, drafts posts, and publishes after you
                approve — no blank-page stress.
              </p>
              <TextureButton
                asChild
                variant="accent"
                size="lg"
                className={cn("mt-5 w-full sm:w-auto")}
              >
                <Link href={graderSignUpHref()}>Start free with Kerygma Social</Link>
              </TextureButton>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full text-center text-sm text-gray-body underline-offset-2 hover:text-near-black hover:underline"
            >
              Grade another business
            </button>
          </div>
        ) : null}
      </div>

      <div className={cn("mt-6 text-center", FROST_CARD, "p-4 md:p-6")}>
        <p className="text-xs text-gray-900">
          Scores are illustrative for planning purposes. Connect your accounts in Kerygma Social
          for real brand-aware posting.
        </p>
      </div>
    </div>
  );
}
