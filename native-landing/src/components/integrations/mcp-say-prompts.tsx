"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPTS = [
  "What is on our calendar for next week?",
  "Write a LinkedIn post about our newest offer.",
  "Make that caption shorter and warmer.",
  "Generate three Instagram posts for this brand.",
  "Good. Approve and schedule it for Tuesday morning.",
] as const;

export function McpSayPrompts() {
  const [active, setActive] = useState(0);
  const prompt = PROMPTS[active] ?? PROMPTS[0];

  return (
    <div className="mx-auto mt-10 max-w-3xl">
      <div className="flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white p-2 shadow-card sm:p-3">
        <p className="min-w-0 flex-1 truncate px-3 py-2 font-playfair text-base italic text-near-black sm:text-lg">
          {prompt}
        </p>
        <Link
          href="/sign-up"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-white transition hover:bg-gold/90"
          aria-label="Get started with Kerygma Social"
        >
          <ArrowUp className="h-5 w-5" />
        </Link>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {PROMPTS.map((item, index) => (
          <button
            key={item}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "max-w-full truncate rounded-full border px-3.5 py-2 text-left text-xs transition sm:text-sm",
              index === active
                ? "border-gold/40 bg-gold/10 text-near-black"
                : "border-black/[0.08] bg-white/80 text-gray-body hover:border-gold/25 hover:text-near-black",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
