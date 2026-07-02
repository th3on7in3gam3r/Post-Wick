"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setVisible(true);
    setProgress(14);
    timersRef.current.push(
      window.setTimeout(() => setProgress(42), 90),
      window.setTimeout(() => setProgress(68), 220),
      window.setTimeout(() => setProgress(88), 480),
    );
  }, [clearTimers]);

  const complete = useCallback(() => {
    clearTimers();
    setProgress(100);
    timersRef.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 260),
    );
  }, [clearTimers]);

  useEffect(() => {
    complete();
  }, [pathname, searchParams, complete]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || anchor.target === "_blank" || anchor.download) return;

      try {
        const nextUrl = new URL(href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;

        const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        const next = `${nextUrl.pathname}${nextUrl.search}`;
        if (next === current) return;

        start();
      } catch {
        // ignore malformed href
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, searchParams, start]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] opacity-0 transition-opacity duration-200",
        visible && "opacity-100",
      )}
      aria-hidden={!visible}
    >
      <div
        className="h-full bg-gradient-to-r from-gold via-[#d4a043] to-gold shadow-[0_0_12px_rgba(184,122,31,0.45)] transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
