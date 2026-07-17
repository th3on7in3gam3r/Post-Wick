"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useActiveClient } from "@/components/app/client-context";
import { AppHeader } from "@/components/app/app-header";
import { clientInitials, postMatchesClient } from "@/lib/clients";

export function AppHeaderWithClient({
  title,
  description,
  action,
  clientAsTitle = false,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  clientAsTitle?: boolean;
}) {
  const { activeClient } = useActiveClient();
  const headerTitle = clientAsTitle ? activeClient.name : (title ?? activeClient.name);
  const fullDescription = clientAsTitle
    ? description
    : description
      ? activeClient.id
        ? `${activeClient.name} — ${description}`
        : description
      : activeClient.name;

  return (
    <AppHeader
      title={headerTitle}
      description={fullDescription}
      action={action}
      clientHero={clientAsTitle}
    />
  );
}

function ActiveClientLogo({
  name,
  logoUrl,
}: {
  name: string;
  logoUrl: string | null;
}) {
  const [failed, setFailed] = useState(false);
  const isBrokenProxy =
    Boolean(logoUrl) &&
    /s2\/favicons|faviconV2|gstatic\.com\/favicon/i.test(logoUrl ?? "");

  if (logoUrl && !failed && !isBrokenProxy) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream text-sm font-semibold text-gold">
      {clientInitials(name)}
    </div>
  );
}

export function ActiveClientBanner() {
  const { activeClient } = useActiveClient();

  if (!activeClient.id) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/25 bg-white px-4 py-3 shadow-card">
      <ActiveClientLogo name={activeClient.name} logoUrl={activeClient.logoUrl} />
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

export function useClientFilteredPosts<T extends { brandId?: string; brandName?: string }>(
  posts: T[],
) {
  const { activeClient } = useActiveClient();

  return useMemo(() => {
    if (!activeClient.id) return posts;
    return posts.filter((post) => postMatchesClient(post, activeClient));
  }, [posts, activeClient]);
}
