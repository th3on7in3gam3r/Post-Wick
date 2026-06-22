"use client";

import {
  BookmarkIcon,
  CommentIcon,
  FacebookIcon,
  HeartIcon,
  InstagramIcon,
  LinkedInIcon,
  SendIcon,
} from "./icons";

const cards = [
  {
    type: "instagram" as const,
    brand: "Braid & Co",
    status: true,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=640&q=80",
    caption: (
      <>
        <strong className="font-playfair italic text-gold">Braid & Co</strong>{" "}
        <span className="font-playfair italic text-near-black">
          Our hair ties are made to last – without damaging your hair.
        </span>
      </>
    ),
    showActions: true,
    share: true,
  },
  {
    type: "linkedin" as const,
    brand: "Recruito",
    timestamp: "1h",
    copyAbove: true,
    copy: (
      <p className="font-playfair text-[0.9rem] italic leading-relaxed text-near-black">
        &ldquo;Recruiting isn&apos;t rocket science. It&apos;s actually pretty
        simple when it&apos;s done right.&rdquo;
      </p>
    ),
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=640&q=80",
  },
  {
    type: "instagram" as const,
    brand: "Nordlys Sea Sauna",
    status: true,
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=640&q=80",
    caption: (
      <>
        <strong className="font-playfair italic text-gold">Nordlys Sea Sauna</strong>{" "}
        <span className="font-playfair italic text-near-black">
          After a long day in the sauna, nothing beats the fresh sea air.
        </span>
      </>
    ),
    showActions: true,
  },
  {
    type: "facebook" as const,
    brand: "Nordlys Sea Sauna",
    copyAbove: true,
    copy: (
      <p className="font-playfair text-[0.9rem] italic leading-relaxed text-near-black">
        Nothing beats the fresh sea air. Experiences you&apos;ll never forget.
      </p>
    ),
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=640&q=80",
  },
  {
    type: "linkedin" as const,
    brand: "Nordlys Sea Sauna",
    timestamp: "2h",
    copyAbove: true,
    copy: (
      <p className="font-playfair text-[0.9rem] italic leading-relaxed text-near-black">
        Why we use three weather models, not one. The multi-source approach that
        turns uncertainty into confidence.
      </p>
    ),
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=640&q=80",
  },
];

type Card = (typeof cards)[number];

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

function PostCard({ card }: { card: Card }) {
  return (
    <article className="w-[320px] flex-shrink-0 rounded-2xl bg-card-bg p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.type === "instagram" && <InstagramIcon />}
          {card.type === "linkedin" && <LinkedInIcon />}
          {card.type === "facebook" && <FacebookIcon />}
          <span className="text-[0.95rem] font-semibold text-near-black">
            {card.brand}
          </span>
          {card.timestamp && (
            <span className="text-[0.8rem] text-gray-label">
              · {card.timestamp}
            </span>
          )}
        </div>
        {card.status && (
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF6B35]" />
        )}
      </div>

      {card.copy && card.copyAbove && <div className="mb-3">{card.copy}</div>}

      <PostImage src={card.image} alt={`${card.brand} post`} />

      {card.showActions && (
        <div className="mb-2 flex items-center justify-between text-near-black/70">
          <div className="flex items-center gap-3">
            <HeartIcon />
            <CommentIcon />
            <SendIcon />
          </div>
          <BookmarkIcon />
        </div>
      )}

      {card.caption && (
        <p className="text-[0.85rem] leading-relaxed">{card.caption}</p>
      )}

      {card.share && (
        <p className="mt-3 text-[0.8rem] font-medium text-gray-label">Share</p>
      )}
    </article>
  );
}

export function PostCarousel() {
  const loop = [...cards, ...cards];

  return (
    <section className="relative overflow-hidden bg-cream py-14">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent" />

      <div className="flex w-max animate-carousel gap-5 px-10 pb-2 pt-2 hover:[animation-play-state:paused]">
        {loop.map((card, i) => (
          <PostCard key={`${card.brand}-${card.type}-${i}`} card={card} />
        ))}
      </div>
    </section>
  );
}
