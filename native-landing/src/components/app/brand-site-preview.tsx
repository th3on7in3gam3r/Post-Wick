"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Globe, Sparkles } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
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
  brandId,
  industry,
  children,
}: {
  name: string;
  websiteUrl: string;
  logoUrl: string | null;
  siteImageUrl: string | null;
  className?: string;
  variant?: "card" | "identity";
  brandId?: string;
  industry?: string;
  children?: ReactNode;
}) {
  const [heroFailed, setHeroFailed] = useState(false);
  const { activeClient, setActiveClientId } = useActiveClient();
  const isActiveClient = Boolean(brandId && activeClient.id === brandId);
  const heroUrl =
    siteImageUrl && !isLikelyIconAsset(siteImageUrl) && !heroFailed ? siteImageUrl : null;

  if (variant === "identity") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border shadow-card",
          isActiveClient ? "border-gold/30 bg-white" : "border-black/[0.06] bg-white",
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-playfair text-xl italic text-near-black">{name}</p>
                {isActiveClient ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gold">
                    <CheckCircle2 className="h-3 w-3" />
                    Active client
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 truncate text-sm text-gray-body">{websiteUrl}</p>
              {industry ? (
                <p className="mt-1 truncate text-xs text-gray-label">{industry}</p>
              ) : null}
              {brandId && !isActiveClient ? (
                <p className="mt-1 text-xs text-gray-body">
                  Active client is {activeClient.name}. Switch to generate for {name}.
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {children}
            {brandId ? (
              isActiveClient ? (
                <Link
                  href="/queue"
                  className="inline-flex items-center justify-center rounded-xl border border-black/[0.06] bg-cream/70 px-3 py-2 text-sm font-medium text-near-black transition hover:bg-cream"
                >
                  Open queue
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveClientId(brandId)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm font-medium text-gold transition hover:bg-cream"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Set as active
                </button>
              )
            ) : null}
          </div>
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
