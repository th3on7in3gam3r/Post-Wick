"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const LOADING_ICON = "/images/kerygma-loading-icon.png";

const SIZE_CONFIG = {
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-[4.5rem] w-[4.5rem]", px: 72 },
  lg: { box: "h-20 w-20", px: 80 },
} as const;

type BrandLoaderRingProps = {
  size?: keyof typeof SIZE_CONFIG;
  className?: string;
};

export function BrandLoaderRing({ size = "md", className }: BrandLoaderRingProps) {
  const { box, px } = SIZE_CONFIG[size];

  return (
    <div className={cn("relative flex items-center justify-center", box, className)} aria-hidden>
      <Image
        src={LOADING_ICON}
        alt=""
        width={px}
        height={px}
        className="h-full w-full animate-brand-loader-pulse object-contain drop-shadow-[0_4px_16px_rgba(61,90,69,0.12)]"
        priority
      />
    </div>
  );
}

type BrandLoaderProps = {
  label?: string;
  size?: keyof typeof SIZE_CONFIG;
  className?: string;
};

export function BrandLoader({ label = "Loading…", size = "md", className }: BrandLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <BrandLoaderRing size={size} />
      {label ? <p className="text-sm font-medium text-gray-body">{label}</p> : null}
    </div>
  );
}
