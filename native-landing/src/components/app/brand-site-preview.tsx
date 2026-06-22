"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

function isLikelyIconAsset(url: string) {
  return /favicon|apple-touch-icon|s2\/favicons|icon\.(?:png|ico|svg)/i.test(url);
}

export function BrandSitePreview({
  name,
  websiteUrl,
  logoUrl,
  siteImageUrl,
  className,
  variant = "card",
  children,
}: {
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
  siteImageUrl: string | null;
  className?: string;
  variant?: "card" | "identity";
  children?: React.ReactNode;
}) {
  const [heroFailed, setHeroFailed] = useState(false);
  const heroUrl =
    siteImageUrl && !isLikelyIconAsset(siteImageUrl) && !heroFailed ? siteImageUrl : null;

  if (variant === "identity") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card",
          className,
        )}
      >
        {heroUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroUrl}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.12] blur-2xl"
            referrerPolicy="no-referrer"
            onError={() => setHeroFailed(true)}
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cream via-white to-cream-dark" />
        )}

        <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={`${name} logo`}
                className="h-14 w-14 shrink-0 rounded-xl border border-black/[0.06] bg-white object-contain p-1.5 shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-white shadow-sm">
                <Globe className="h-6 w-6 text-gold" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-playfair text-xl italic text-near-black">{name}</p>
              <p className="mt-0.5 truncate text-sm text-gray-body">{websiteUrl}</p>
            </div>
          </div>
          {children ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">{children}</div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-28 overflow-hidden bg-cream", className)}>
      {heroUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={heroUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-md"
          referrerPolicy="no-referrer"
          onError={() => setHeroFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-white to-cream-dark" />
      )}

      <div className="relative flex h-full items-center justify-center px-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={`${name} logo`}
            className="h-12 w-12 rounded-xl border border-black/[0.06] bg-white object-contain p-1 shadow-sm"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="rounded-full bg-white p-3 shadow-sm">
            <Globe className="h-5 w-5 text-gold" />
          </div>
        )}
      </div>
    </div>
  );
}
