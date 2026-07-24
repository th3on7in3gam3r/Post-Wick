"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { GROWTH_STACK } from "@/lib/growth-stack";
import { TextureButton } from "@/components/ui/texture-button";
import { cn } from "@/lib/utils";

const PATH = [
  {
    key: "citePilot" as const,
    label: "Start here",
    tabCue: "Start",
    blurb: "See how AI answers mention your brand before you plan the campaign.",
  },
  {
    key: "aiCmo" as const,
    label: "Then",
    blurb: "Turn visibility gaps into strategy, audits, and a clear campaign workspace.",
  },
  {
    key: "aegis" as const,
    label: "Then",
    blurb: "Check the site for vulnerabilities before you put the brand in front of more people.",
  },
  {
    key: "kerygma" as const,
    label: "You are here",
    tabCue: "You are here",
    current: true,
    blurb: "Turn your URL into approved social posts and publish on autopilot.",
  },
  {
    key: "postwick" as const,
    label: "Then",
    blurb: "Share public brand posts on the network once your feed is running.",
  },
] as const;

type PathKey = (typeof PATH)[number]["key"];

export function GrowthStackTabs() {
  const baseId = useId();
  const [activeKey, setActiveKey] = useState<PathKey>("kerygma");
  const activeIndex = PATH.findIndex((item) => item.key === activeKey);
  const active = PATH[activeIndex] ?? PATH[3];
  const product = GROWTH_STACK[active.key];
  const isCurrent = Boolean("current" in active && active.current);

  function selectByIndex(index: number) {
    const next = PATH[index];
    if (!next) return;
    setActiveKey(next.key);
    requestAnimationFrame(() => {
      document.getElementById(`${baseId}-tab-${next.key}`)?.focus();
    });
  }

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card">
      <div
        role="tablist"
        aria-label="Growth stack products"
        className="hide-scrollbar flex gap-0 overflow-x-auto border-b border-black/[0.06] px-2 sm:px-4"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            selectByIndex((activeIndex + 1) % PATH.length);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            selectByIndex((activeIndex - 1 + PATH.length) % PATH.length);
          } else if (event.key === "Home") {
            event.preventDefault();
            selectByIndex(0);
          } else if (event.key === "End") {
            event.preventDefault();
            selectByIndex(PATH.length - 1);
          }
        }}
      >
        {PATH.map((item) => {
          const selected = item.key === activeKey;
          const tabId = `${baseId}-tab-${item.key}`;
          const panelId = `${baseId}-panel-${item.key}`;
          const cue = "tabCue" in item ? item.tabCue : undefined;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={tabId}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveKey(item.key)}
              className={cn(
                "relative shrink-0 px-3 py-3.5 text-sm font-medium transition-colors sm:px-4",
                selected ? "text-near-black" : "text-gray-body hover:text-near-black",
              )}
            >
              <span className="flex min-h-[2.75rem] flex-col items-start justify-end gap-0.5">
                <span
                  className={cn(
                    "text-[0.6rem] font-semibold uppercase tracking-[0.16em]",
                    cue ? "text-gold" : "invisible",
                  )}
                >
                  {cue ?? "·"}
                </span>
                <span>{GROWTH_STACK[item.key].name}</span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-3 bottom-0 h-0.5 origin-left bg-gold transition-transform duration-200 sm:inset-x-4",
                  selected ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div
        key={active.key}
        role="tabpanel"
        id={`${baseId}-panel-${active.key}`}
        aria-labelledby={`${baseId}-tab-${active.key}`}
        className="growth-stack-fade px-6 py-8 sm:px-8"
      >
        <p
          className={cn(
            "text-[0.65rem] font-semibold uppercase tracking-[0.18em]",
            isCurrent || active.key === "citePilot" ? "text-gold" : "text-gray-label",
          )}
        >
          {active.label}
        </p>
        <h3 className="mt-2 font-playfair text-[clamp(1.5rem,2.5vw,2rem)] italic text-near-black">
          {product.name}
        </h3>
        <p className="mt-2 max-w-xl text-base text-gray-body">{product.tagline}</p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-label">{active.blurb}</p>

        <div className="mt-6">
          {isCurrent ? (
            <TextureButton asChild variant="primary" size="sm">
              <Link href="/sign-up">Get started →</Link>
            </TextureButton>
          ) : (
            <Link
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-gold transition hover:text-near-black"
            >
              Learn more →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
