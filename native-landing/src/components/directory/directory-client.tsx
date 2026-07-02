"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { TextureButton } from "@/components/ui/texture-button";
import {
  DIRECTORY_NICHE_FILTERS,
  filterPublicBrandListings,
  publicFeedHref,
  type DirectoryNicheFilterId,
  type PublicBrandListing,
} from "@/lib/directory/public-brands";
import { cn } from "@/lib/utils";

export function DirectoryClient({ listings }: { listings: PublicBrandListing[] }) {
  const [query, setQuery] = useState("");
  const [niche, setNiche] = useState<DirectoryNicheFilterId>("all");

  const filtered = useMemo(
    () => filterPublicBrandListings(listings, { query, niche }),
    [listings, query, niche],
  );

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="text-center">
        <span className="animate-fade-drop inline-block rounded-full bg-white px-4 py-1.5 text-sm font-medium text-near-black shadow-sm">
          Directory
        </span>
        <h1 className="animate-fade-drop-delay-1 mt-6 font-playfair text-[clamp(2.25rem,4vw,3.25rem)] italic leading-tight text-near-black">
          Businesses on Kerygma Social
        </h1>
        <p className="body-copy animate-fade-drop-delay-2 mx-auto mt-4 max-w-[640px] text-[1.05rem]">
          Discover local and faith-based brands using Kerygma Social to keep their feeds
          consistent, on-brand, and on schedule.
        </p>
      </div>

      <div className="animate-fade-drop-delay-3 mt-12 rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-label" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by business name…"
              className="w-full rounded-xl border border-black/[0.1] bg-cream/50 py-3 pl-11 pr-4 text-sm text-near-black outline-none ring-gold/30 placeholder:text-gray-label focus:ring-2"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {DIRECTORY_NICHE_FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setNiche(item.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  niche === item.id
                    ? "bg-near-black text-white"
                    : "bg-cream text-gray-body hover:bg-cream-dark",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-body">
          {filtered.length} business{filtered.length === 1 ? "" : "es"} shown
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-black/[0.12] bg-white/70 px-8 py-16 text-center shadow-card">
          <p className="font-playfair text-2xl italic text-near-black">No listings yet</p>
          <p className="body-copy mx-auto mt-3 max-w-md text-sm">
            {listings.length === 0
              ? "Public directory listings will appear here as brands opt in. Want to be first?"
              : "No businesses match your search. Try another niche or clear the search box."}
          </p>
          <TextureButton asChild variant="primary" size="lg" className="mt-6">
            <Link href="/get-started?ref=directory">Get started with Kerygma Social</Link>
          </TextureButton>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-col rounded-3xl border border-black/[0.06] bg-white p-6 shadow-card"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
                {listing.niche}
              </p>
              <h2 className="mt-2 font-playfair text-2xl italic text-near-black">
                {listing.name}
              </h2>
              {listing.description ? (
                <p className="mt-3 line-clamp-3 text-sm text-gray-body">{listing.description}</p>
              ) : (
                <p className="mt-3 text-sm text-gray-body">{listing.websiteUrl}</p>
              )}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <TextureButton asChild variant="primary" size="sm" className="flex-1">
                  <Link href={publicFeedHref(listing)}>View feed</Link>
                </TextureButton>
                <TextureButton asChild variant="secondary" size="sm" className="flex-1">
                  <a href={listing.websiteUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Website
                  </a>
                </TextureButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-16 rounded-3xl border border-black/[0.06] bg-near-black px-8 py-10 text-center text-white">
        <p className="font-playfair text-3xl italic">Want your business listed here?</p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/75">
          Join Kerygma Social, set up your brand, and opt in to the public directory from your
          brand settings.
        </p>
        <TextureButton asChild variant="accent" size="lg" className="mt-6">
          <Link href="/get-started?ref=directory">Start free</Link>
        </TextureButton>
      </div>
    </div>
  );
}
