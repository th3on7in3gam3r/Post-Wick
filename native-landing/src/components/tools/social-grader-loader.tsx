"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BrandLoaderRing } from "@/components/ui/brand-loader";

type SocialGraderLoaderProps = {
  message: string;
  className?: string;
};

export function SocialGraderLoader({ message, className }: SocialGraderLoaderProps) {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        return Math.min(current + Math.random() * 10 + 5, 92);
      });
    }, 380);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={cn("flex flex-col items-center py-10 text-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={message}
    >
      <BrandLoaderRing size="md" />

      <p className="mt-6 font-medium text-gray-900">{message}</p>
      <p className="mt-2 text-sm text-gray-body">This usually takes a few seconds.</p>

      <div className="mt-8 w-full max-w-sm">
        <div className="h-2 overflow-hidden rounded-full bg-cream">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-[#d4a043] transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs font-medium tabular-nums text-gray-label">
          Analyzing… {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
