"use client";

import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
  InstagramIcon,
  LinkedInIcon,
  SendIcon,
} from "./icons";
import { samplePosts, type SamplePost } from "@/lib/sample-posts";

function PostImage({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="mb-3 h-[200px] w-full rounded-xl object-cover"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src =
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23F0EDE4'/%3E%3Cstop offset='1' stop-color='%23E8E4D9'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='640' height='400'/%3E%3C/svg%3E";
      }}
    />
  );
}

function PostCaption({ brand, caption, type }: Pick<SamplePost, "brand" | "caption" | "type">) {
  if (type === "instagram") {
    return (
      <p className="text-[0.85rem] leading-relaxed">
        <strong className="font-playfair italic text-gold">{brand}</strong>{" "}
        <span className="font-playfair italic text-near-black">{caption}</span>
      </p>
    );
  }

  return (
    <p className="font-playfair text-[0.9rem] italic leading-relaxed text-near-black">
      &ldquo;{caption}&rdquo;
    </p>
  );
}

function PostCard({ card }: { card: SamplePost }) {
  return (
    <article className="w-[320px] flex-shrink-0 rounded-2xl bg-card-bg p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.type === "instagram" && <InstagramIcon />}
          {card.type === "linkedin" && <LinkedInIcon />}
          <span className="text-[0.95rem] font-semibold text-near-black">{card.brand}</span>
          {card.timestamp ? (
            <span className="text-[0.8rem] text-gray-label">· {card.timestamp}</span>
          ) : null}
        </div>
        {card.status ? <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B35]" /> : null}
      </div>

      {card.copyAbove ? (
        <div className="mb-3">
          <PostCaption brand={card.brand} caption={card.caption} type={card.type} />
        </div>
      ) : null}

      <PostImage src={card.image} alt={`${card.brand} post`} />

      {card.showActions ? (
        <div className="mb-2 flex items-center justify-between text-near-black/70">
          <div className="flex items-center gap-3">
            <HeartIcon />
            <CommentIcon />
            <SendIcon />
          </div>
          <BookmarkIcon />
        </div>
      ) : null}

      {!card.copyAbove ? (
        <PostCaption brand={card.brand} caption={card.caption} type={card.type} />
      ) : null}

      {card.share ? (
        <p className="mt-3 text-[0.8rem] font-medium text-gray-label">Share</p>
      ) : null}
    </article>
  );
}

export function PostCarousel() {
  const loop = [...samplePosts, ...samplePosts];

  return (
    <section className="relative overflow-hidden bg-cream py-14">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent" />

      <div className="flex w-max animate-carousel gap-5 px-10 pb-2 pt-2 hover:[animation-play-state:paused]">
        {loop.map((card, index) => (
          <PostCard key={`${card.id}-${index}`} card={card} />
        ))}
      </div>
    </section>
  );
}
