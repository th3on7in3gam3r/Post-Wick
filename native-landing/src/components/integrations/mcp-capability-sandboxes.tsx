"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const CAPABILITIES = [
  {
    id: "voice",
    title: "Read your brand voice",
    body: "Tone, language, and how you write — everything Kerygma learned from your site.",
  },
  {
    id: "write",
    title: "Write a post",
    body: "Generate drafts for LinkedIn, Instagram, Pinterest, Bluesky, and more from a simple ask.",
  },
  {
    id: "rework",
    title: "Rework the words",
    body: "Ask for shorter, warmer, or less salesy — then approve when it feels right.",
  },
  {
    id: "schedule",
    title: "Put it on the calendar",
    body: "Approve to auto-schedule into the next open slot, or pick a time yourself.",
  },
  {
    id: "status",
    title: "Check what happened",
    body: "See what is pending, what is scheduled, and what already went live.",
  },
  {
    id: "chat",
    title: "Stay in your assistant",
    body: "Keep the chat open in Claude or ChatGPT while Kerygma does the queue work.",
  },
] as const;

type CapId = (typeof CAPABILITIES)[number]["id"];

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

function SandboxFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-black/[0.06] bg-cream/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-black/15" />
        <span className="h-2 w-2 rounded-full bg-black/10" />
        <span className="h-2 w-2 rounded-full bg-black/10" />
        <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-label">
          Live preview
        </span>
      </div>
      <div className="min-h-[9.5rem]">{children}</div>
    </div>
  );
}

function VoiceSandbox({ animate }: { animate: boolean }) {
  const tones = ["Warm", "Clear", "Local", "Helpful"];
  const step = useLoop(tones.length, 1600, animate);
  const bars = [10, 18, 12, 24, 14, 22, 11, 19, 13];

  return (
    <SandboxFrame>
      <div className="flex h-full flex-col justify-between gap-4">
        <div className="flex items-end justify-center gap-1.5 pt-2">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="w-1.5 rounded-full bg-gold/75"
              animate={
                animate
                  ? { height: [h, h + 10 + (i % 3) * 4, h] }
                  : { height: h }
              }
              transition={{
                duration: 1.1 + (i % 4) * 0.12,
                repeat: animate ? Infinity : 0,
                ease: "easeInOut",
              }}
              style={{ height: h }}
            />
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {tones.map((tone, i) => (
            <motion.span
              key={tone}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium",
                i === step
                  ? "bg-gold/25 text-near-black"
                  : "bg-white/70 text-gray-label",
              )}
              animate={i === step && animate ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5 }}
            >
              {tone}
            </motion.span>
          ))}
        </div>
      </div>
    </SandboxFrame>
  );
}

function WriteSandbox({ animate }: { animate: boolean }) {
  const draft =
    "Fresh sourdough every morning — come by before we sell out.";
  const step = useLoop(draft.length + 18, 55, animate);
  const visible = animate
    ? draft.slice(0, Math.min(step, draft.length))
    : draft;
  const platform = step > draft.length + 6 ? 1 : 0;

  return (
    <SandboxFrame>
      <div className="space-y-3">
        <div className="min-h-[4.5rem] rounded-xl bg-white px-3 py-3 text-sm leading-relaxed text-near-black shadow-sm">
          {visible}
          {animate && step < draft.length ? (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-gold align-middle" />
          ) : null}
        </div>
        <div className="flex gap-2">
          {["LinkedIn", "Instagram"].map((label, i) => (
            <span
              key={label}
              className={cn(
                "rounded-md px-2 py-0.5 text-[10px] transition-colors duration-500",
                i === platform
                  ? "bg-gold/25 text-near-black"
                  : "bg-black/[0.06] text-gray-body",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </SandboxFrame>
  );
}

function ReworkSandbox({ animate }: { animate: boolean }) {
  const before = "Don't miss our AMAZING deal — buy now!!!";
  const after = "A quieter note on what's fresh this week.";
  const step = useLoop(2, 2800, animate);
  const text = step === 0 ? before : after;

  return (
    <SandboxFrame>
      <div className="flex items-center gap-3">
        <div className="min-h-[4.5rem] flex-1 rounded-2xl bg-white px-3 py-3 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.p
              key={text}
              initial={animate ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animate ? { opacity: 0, y: -6 } : undefined}
              transition={{ duration: 0.35 }}
              className="text-sm leading-relaxed text-near-black"
            >
              {text}
            </motion.p>
          </AnimatePresence>
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-gray-label">
            {step === 0 ? "Draft" : "Reworked"}
          </p>
        </div>
        <motion.div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-white"
          animate={animate ? { rotate: step === 1 ? 180 : 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          ↻
        </motion.div>
      </div>
    </SandboxFrame>
  );
}

function ScheduleSandbox({ animate }: { animate: boolean }) {
  const step = useLoop(4, 1400, animate);
  const filled = animate ? Math.min(step, 2) : 2;
  const cells = Array.from({ length: 14 }, (_, i) => i);
  const targets = [8, 11];

  return (
    <SandboxFrame>
      <div className="space-y-3">
        <div className="grid grid-cols-7 gap-1">
          {cells.map((i) => {
            const targetIndex = targets.indexOf(i);
            const isOn = targetIndex > -1 && targetIndex < filled;
            return (
              <motion.div
                key={i}
                className={cn(
                  "h-6 rounded-md",
                  isOn ? "bg-gold/70" : "bg-black/[0.05]",
                )}
                animate={
                  isOn && animate
                    ? { scale: [0.85, 1.05, 1], opacity: [0.4, 1, 1] }
                    : {}
                }
                transition={{ duration: 0.45 }}
              />
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={filled}
            initial={animate ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            className="text-center text-[11px] text-gray-body"
          >
            {filled === 0
              ? "Waiting for approval…"
              : filled === 1
                ? "Scheduled Tue · 10:00"
                : "Tue & Fri slots filled"}
          </motion.p>
        </AnimatePresence>
      </div>
    </SandboxFrame>
  );
}

function StatusSandbox({ animate }: { animate: boolean }) {
  const step = useLoop(4, 1600, animate);
  const rows = [
    {
      label: "LinkedIn",
      statuses: ["Pending", "Scheduled", "Live", "Live"] as const,
      widths: [0.3, 0.6, 1, 1],
    },
    {
      label: "Instagram",
      statuses: ["Pending", "Pending", "Scheduled", "Live"] as const,
      widths: [0.2, 0.35, 0.7, 1],
    },
    {
      label: "Facebook",
      statuses: ["Pending", "Pending", "Pending", "Scheduled"] as const,
      widths: [0.15, 0.25, 0.4, 0.75],
    },
  ];

  return (
    <SandboxFrame>
      <div className="flex flex-col justify-center gap-2.5">
        {rows.map((row) => {
          const idx = Math.min(step, 3);
          const label = row.statuses[idx] ?? "Pending";
          const done = label === "Live";
          return (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-[10px] text-gray-label">
                {row.label}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-gold/70"
                  animate={{ width: `${(row.widths[idx] ?? 0.2) * 100}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span
                className={cn(
                  "w-14 text-right text-[10px]",
                  done ? "text-gold" : "text-gray-label",
                )}
              >
                {done ? "✓ Live" : label}
              </span>
            </div>
          );
        })}
      </div>
    </SandboxFrame>
  );
}

function ChatSandbox({ animate }: { animate: boolean }) {
  const step = useLoop(3, 2200, animate);

  return (
    <SandboxFrame>
      <div className="flex h-full flex-col justify-end gap-2">
        <AnimatePresence>
          {step >= 0 ? (
            <motion.div
              key="user"
              initial={animate ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              className="ml-8 rounded-2xl rounded-br-md bg-white px-3 py-2 text-[12px] text-near-black shadow-sm"
            >
              Schedule that LinkedIn post for Tuesday.
            </motion.div>
          ) : null}
          {step >= 1 ? (
            <motion.div
              key="assistant"
              initial={animate ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              className="mr-6 rounded-2xl rounded-bl-md bg-gold/15 px-3 py-2 text-[12px] text-near-black"
            >
              Approved and on the calendar for Tue 10:00.
            </motion.div>
          ) : null}
          {step >= 2 ? (
            <motion.div
              key="done"
              initial={animate ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              className="self-start rounded-full bg-sage/30 px-2.5 py-1 text-[10px] font-medium text-near-black"
            >
              Queued in Kerygma ✓
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </SandboxFrame>
  );
}

function SandboxFor({ id, animate }: { id: CapId; animate: boolean }) {
  switch (id) {
    case "voice":
      return <VoiceSandbox animate={animate} />;
    case "write":
      return <WriteSandbox animate={animate} />;
    case "rework":
      return <ReworkSandbox animate={animate} />;
    case "schedule":
      return <ScheduleSandbox animate={animate} />;
    case "status":
      return <StatusSandbox animate={animate} />;
    case "chat":
      return <ChatSandbox animate={animate} />;
  }
}

export function McpCapabilitySandboxes() {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  return (
    <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2">
      {CAPABILITIES.map((item) => (
        <div key={item.id} className="min-w-0">
          <SandboxFor id={item.id} animate={animate} />
          <h3 className="mt-4 text-lg font-semibold text-near-black">{item.title}</h3>
          <p className="body-copy mt-1.5 text-sm">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
