"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const TIPS = [
  "AI images can take a minute—keep snapping while we work.",
  "Hang tight—providers run in order (OpenAI → Gemini → Ideogram).",
  "Good visuals take a few beats. You’re doing great.",
  "Snap the polaroids for points. We’ll ping you when images are ready.",
  "Still painting your posts… almost there.",
];

const MAX_POLAROIDS = 6;
const SPAWN_MS = 900;
const FIELD_HEIGHT = 240;

type Polaroid = {
  id: number;
  x: number;
  y: number;
  rotate: number;
  speed: number;
  tint: string;
};

const TINTS = ["#f5f0e6", "#efe8dc", "#f8f4ec", "#ebe4d6", "#f2ebe0"];

export function ImageWaitGame({ active }: { active: boolean }) {
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const playfieldRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setScore(0);
      setElapsed(0);
      setTipIndex(0);
      setPolaroids([]);
      nextIdRef.current = 0;
      lastTsRef.current = null;
      return;
    }

    const startedAt = Date.now();
    const elapsedTimer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 500);

    const tipTimer = window.setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000);

    const spawnTimer = window.setInterval(() => {
      setPolaroids((prev) => {
        if (prev.length >= MAX_POLAROIDS) return prev;
        const id = nextIdRef.current++;
        return [
          ...prev,
          {
            id,
            x: 8 + Math.random() * 72,
            y: -18,
            rotate: -18 + Math.random() * 36,
            speed: 18 + Math.random() * 22,
            tint: TINTS[id % TINTS.length]!,
          },
        ];
      });
    }, SPAWN_MS);

    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05);
      lastTsRef.current = ts;

      setPolaroids((prev) =>
        prev
          .map((p) => ({ ...p, y: p.y + p.speed * dt }))
          .filter((p) => p.y < FIELD_HEIGHT + 40),
      );

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.clearInterval(elapsedTimer);
      window.clearInterval(tipTimer);
      window.clearInterval(spawnTimer);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [active]);

  const snapPolaroid = useCallback((id: number) => {
    setPolaroids((prev) => prev.filter((p) => p.id !== id));
    setScore((s) => s + 1);
  }, []);

  const snapNearest = useCallback(() => {
    setPolaroids((prev) => {
      if (prev.length === 0) return prev;
      const nearest = prev.reduce((best, p) =>
        Math.abs(p.y - FIELD_HEIGHT / 2) < Math.abs(best.y - FIELD_HEIGHT / 2) ? p : best,
      );
      queueMicrotask(() => setScore((s) => s + 1));
      return prev.filter((p) => p.id !== nearest.id);
    });
  }, []);

  if (!active) return null;

  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-card"
      role="status"
      aria-live="polite"
      aria-label="Creating images. Snap polaroids while you wait."
    >
      <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] px-4 py-3">
        <div>
          <p className="font-playfair text-lg italic text-near-black">Snap the Polaroids</p>
          <p className="text-xs text-gray-body">Still painting your posts… {elapsed}s in</p>
        </div>
        <p className="text-sm font-semibold tabular-nums text-gold">
          {score} snap{score === 1 ? "" : "s"}
        </p>
      </div>

      <div
        ref={playfieldRef}
        tabIndex={0}
        className="relative cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
        style={{ height: FIELD_HEIGHT }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            snapNearest();
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cream/80 to-cream-dark/60" />
        <p className="pointer-events-none absolute inset-x-0 top-3 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gray-label">
          Tap to snap
        </p>

        {polaroids.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label="Snap polaroid"
            onClick={() => snapPolaroid(p.id)}
            className={cn(
              "absolute w-14 rounded-sm border border-black/10 bg-white p-1 shadow-sm transition hover:scale-105 active:scale-95",
            )}
            style={{
              left: `${p.x}%`,
              top: p.y,
              transform: `rotate(${p.rotate}deg)`,
              backgroundColor: p.tint,
            }}
          >
            <span
              className="block aspect-square rounded-[2px] bg-gradient-to-br from-[#d4c4a8] via-[#c9b896] to-[#a89070]"
              aria-hidden
            />
            <span className="mt-1 block h-2 w-full rounded-sm bg-white/80" aria-hidden />
          </button>
        ))}
      </div>

      <p className="border-t border-black/[0.06] px-4 py-3 text-xs leading-relaxed text-gray-body">
        {TIPS[tipIndex]}
      </p>
    </div>
  );
}
