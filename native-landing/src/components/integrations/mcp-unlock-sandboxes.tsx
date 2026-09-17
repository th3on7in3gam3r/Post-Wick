"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const UNLOCKS = [
  {
    id: "brand",
    n: "1",
    title: "It knows your brand before it writes",
    body: "Your tone, topics, and positioning from the brand crawl — so drafts sound like you, not a generic AI.",
  },
  {
    id: "work",
    n: "2",
    title: "You see the work, not a description of it",
    body: "Kerygma sends back real pending posts, calendar slots, and schedule times — not vague advice.",
  },
  {
    id: "connect",
    n: "3",
    title: "One address, one key from Settings",
    body: "Paste the MCP URL into Claude or ChatGPT and authenticate with your ks_live_ API key. No custom app to build.",
  },
] as const;

type UnlockId = (typeof UNLOCKS)[number]["id"];

function useLoop(steps: number, ms: number, enabled: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!enabled || steps <= 1) return;
    const id = window.setInterval(() => {
      setStep((s) => (s + 1) % steps);
    }, ms);
    return () => window.clearInterval(id);
  }, [enabled, steps, ms]);
  return step;
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[10rem] overflow-hidden rounded-2xl border border-black/[0.06] bg-cream/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      {children}
    </div>
  );
}

function BrandUnlock({ animate }: { animate: boolean }) {
  const step = useLoop(4, 1800, animate);
  const topics = ["Tone: warm", "Local bakery", "Sourdough", "Community"];
  const lines = [0.55, 0.9, 0.7];

  return (
    <Stage>
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="relative rounded-xl bg-white px-3 py-3 shadow-sm">
          <motion.div
            className="h-2.5 w-20 rounded-full bg-gold/70"
            animate={animate ? { width: ["4.5rem", "5.5rem", "4.5rem"] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {lines.map((w, i) => (
            <motion.div
              key={i}
              className="mt-2 h-1.5 rounded-full bg-black/[0.08]"
              style={{ width: `${w * 100}%` }}
              animate={
                animate
                  ? { opacity: [0.35, 1, 0.35], x: [0, 2, 0] }
                  : { opacity: 1 }
              }
              transition={{
                duration: 1.8,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            className="absolute -bottom-2 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-sage/50 text-[10px] font-semibold text-near-black"
            animate={animate ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            DNA
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={topics[step]}
            initial={animate ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animate ? { opacity: 0, y: -4 } : undefined}
            className="text-center text-[11px] font-medium text-near-black"
          >
            Learned · {topics[step]}
          </motion.p>
        </AnimatePresence>
      </div>
    </Stage>
  );
}

function WorkUnlock({ animate }: { animate: boolean }) {
  const step = useLoop(5, 1200, animate);
  const cells = Array.from({ length: 8 }, (_, i) => i);
  const active = animate ? [2, 5].filter((_, idx) => step > idx + 1) : [2, 5];
  const labels =
    step < 2
      ? "Assistant asks…"
      : step < 4
        ? "Real calendar returned"
        : "Tue 10:00 · Fri 10:00";

  return (
    <Stage>
      <div className="flex h-full flex-col justify-between gap-3">
        <div className="grid grid-cols-4 gap-1.5">
          {cells.map((i) => {
            const on = active.includes(i);
            return (
              <motion.div
                key={i}
                className={cn(
                  "h-9 rounded-lg",
                  on ? "bg-gold/65" : "bg-black/[0.06]",
                )}
                animate={
                  on && animate
                    ? { scale: [0.9, 1.05, 1], opacity: [0.5, 1, 1] }
                    : {}
                }
                transition={{ duration: 0.4 }}
              />
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={labels}
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="text-center text-[11px] text-gray-body"
          >
            {labels}
          </motion.p>
        </AnimatePresence>
      </div>
    </Stage>
  );
}

function ConnectUnlock({ animate }: { animate: boolean }) {
  const step = useLoop(4, 1600, animate);

  return (
    <Stage>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div className="flex w-full items-center justify-center gap-3 px-2">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-lg text-gold"
            animate={animate ? { scale: step >= 1 ? 1 : [1, 1.06, 1] } : {}}
            transition={{ duration: 1.2, repeat: step < 1 ? Infinity : 0 }}
          >
            ✦
          </motion.div>
          <div className="relative h-px flex-1 max-w-[5rem] bg-black/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gold"
              animate={{ width: step >= 2 ? "100%" : step >= 1 ? "55%" : "0%" }}
              transition={{ duration: 0.5 }}
            />
            {animate && step >= 1 && step < 3 ? (
              <motion.span
                className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-gold"
                animate={{ left: ["0%", "100%"] }}
                transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
              />
            ) : null}
          </div>
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-full bg-sage/35 text-lg text-near-black"
            animate={
              animate && step >= 2 ? { scale: [0.92, 1.06, 1] } : {}
            }
            transition={{ duration: 0.45 }}
          >
            ✦
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={animate ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animate ? { opacity: 0 } : undefined}
            className="text-center text-[11px] text-gray-body"
          >
            {step === 0
              ? "Paste MCP URL"
              : step === 1
                ? "Add Bearer ks_live_…"
                : step === 2
                  ? "Assistant connected"
                  : "Ready in Settings"}
          </motion.p>
        </AnimatePresence>
      </div>
    </Stage>
  );
}

function UnlockSandbox({ id, animate }: { id: UnlockId; animate: boolean }) {
  switch (id) {
    case "brand":
      return <BrandUnlock animate={animate} />;
    case "work":
      return <WorkUnlock animate={animate} />;
    case "connect":
      return <ConnectUnlock animate={animate} />;
  }
}

export function McpUnlockSandboxes() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <div className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-3">
      {UNLOCKS.map((item) => (
        <div key={item.id} className="min-w-0">
          <UnlockSandbox id={item.id} animate={animate} />
          <h3 className="mt-4 font-playfair text-xl italic text-near-black">
            <span className="mr-2 text-gold">{item.n}</span>
            {item.title}
          </h3>
          <p className="body-copy mt-2 text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
