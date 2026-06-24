"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useActiveClient } from "@/components/app/client-context";
import { AppHeader } from "@/components/app/app-header";
import { clientInitials, postMatchesClient } from "@/lib/clients";
import { cn } from "@/lib/utils";

export function AppHeaderWithClient({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { activeClient } = useActiveClient();
  const fullDescription = description
    ? activeClient.id
      ? `${activeClient.name} — ${description}`
      : description
    : activeClient.name;

  return <AppHeader title={title} description={fullDescription} />;
}

export function ActiveClientBanner() {
  const { activeClient } = useActiveClient();

  if (!activeClient.id) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/25 bg-white px-4 py-3 shadow-card">
      {activeClient.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activeClient.logoUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-gold">
          {clientInitials(activeClient.name)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-near-black">{activeClient.name}</p>
        <p className="truncate text-xs text-gray-body">{activeClient.industry}</p>
      </div>
      <Link href="/brands" className="text-xs font-medium text-gold hover:opacity-80">
        All brands
      </Link>
    </div>
  );
}

type BrandClientIndicatorProps = {
  brandId: string;
  name: string;
  logoUrl: string | null;
  industry: string;
};

export function BrandClientIndicator({
  brandId,
  name,
  logoUrl,
  industry,
}: BrandClientIndicatorProps) {
  const { activeClient, setActiveClientId } = useActiveClient();
  const isActive = activeClient.id === brandId;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-card sm:flex-row sm:items-center",
        isActive ? "border-gold/30 bg-white" : "border-black/[0.08] bg-cream/50",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-gold">
            {clientInitials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-near-black">{name}</p>
            {isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-gold">
                <CheckCircle2 className="h-3 w-3" />
                Active client
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-gray-body">
            {isActive
              ? "Posts you generate here apply to this brand across the dashboard."
              : `Active client is ${activeClient.name}. Switch to generate for ${name}.`}
          </p>
          <p className="mt-0.5 truncate text-xs text-gray-label">{industry}</p>
        </div>
      </div>

      {!isActive ? (
        <button
          type="button"
          onClick={() => setActiveClientId(brandId)}
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gold/30 bg-white px-3 py-2 text-sm font-medium text-gold transition hover:bg-cream"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Set as active client
        </button>
      ) : (
        <Link
          href="/queue"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-cream/70 px-3 py-2 text-sm font-medium text-near-black transition hover:bg-cream"
        >
          Open queue
        </Link>
      )}
    </div>
  );
}

export function useClientFilteredPosts<T extends { brandId?: string; brandName?: string }>(
  posts: T[],
) {
  const { activeClient } = useActiveClient();

  return useMemo(() => {
    if (!activeClient.id) return posts;
    return posts.filter((post) => postMatchesClient(post, activeClient));
  }, [posts, activeClient]);
}
