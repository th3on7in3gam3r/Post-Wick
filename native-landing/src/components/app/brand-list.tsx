"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { BrandSitePreview } from "@/components/app/brand-site-preview";

type Brand = {
  id: string;
  name: string;
  websiteUrl: string;
  crawlStatus: string;
  logoUrl: string | null;
  siteImageUrl: string | null;
};

export function BrandList({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(brand: Brand) {
    const confirmed = window.confirm(
      `Delete "${brand.name}"? This removes all posts and connections for this brand.`,
    );
    if (!confirmed) return;

    setDeletingId(brand.id);
    try {
      const response = await fetch(`/api/brands/${brand.id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete brand");
      }
      router.refresh();
    } catch {
      window.alert("Could not delete this brand. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {brands.map((brand) => (
        <article
          key={brand.id}
          className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-card transition hover:border-gold/30"
        >
          <Link href={`/brands/${brand.id}`} className="block">
            <BrandSitePreview
              name={brand.name}
              websiteUrl={brand.websiteUrl}
              logoUrl={brand.logoUrl}
              siteImageUrl={brand.siteImageUrl}
              className="rounded-none border-0 shadow-none"
            />
          </Link>

          <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-4 py-3">
            <Link href={`/brands/${brand.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium text-near-black">{brand.name}</p>
              <p className="mt-0.5 text-xs uppercase tracking-[0.12em] text-gray-label">
                {brand.crawlStatus}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => void handleDelete(brand)}
              disabled={deletingId === brand.id}
              className="rounded-lg p-2 text-gray-label transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              aria-label={`Delete ${brand.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
