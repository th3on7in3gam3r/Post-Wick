"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
  initials?: string;
  accent?: string;
};

type AnimatedTestimonialsProps = {
  testimonials: Testimonial[];
  autoplay?: boolean;
  className?: string;
};

function CardFace({
  testimonial,
}: {
  testimonial: Testimonial;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={testimonial.src}
        alt={testimonial.name}
        draggable={false}
        className="h-full w-full rounded-xl object-cover object-center"
      />
      <div className="absolute inset-x-2 bottom-2 rounded-lg bg-white/92 px-3 py-2 text-left shadow-sm backdrop-blur-sm">
        <p className="font-playfair text-sm italic leading-tight text-near-black">
          {testimonial.name}
        </p>
        <p className="mt-0.5 text-[0.68rem] font-medium text-gold">
          {testimonial.designation}
        </p>
      </div>
    </div>
  );
}

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
  className,
}: AnimatedTestimonialsProps) {
  const [active, setActive] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = testimonials.length;
  const current = testimonials[active];

  const clearFlipTimer = () => {
    if (flipTimer.current) {
      clearTimeout(flipTimer.current);
      flipTimer.current = null;
    }
  };

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (flipping || total <= 1) return;

      clearFlipTimer();
      setDirection(dir);
      setFlipping(true);

      flipTimer.current = setTimeout(() => {
        setActive((prev) => (prev + dir + total) % total);
        setFlipping(false);
      }, 420);
    },
    [flipping, total],
  );

  const handleNext = useCallback(() => advance(1), [advance]);
  const handlePrev = useCallback(() => advance(-1), [advance]);

  const goTo = (index: number) => {
    if (index === active || flipping) return;
    clearFlipTimer();
    setDirection(index > active ? 1 : -1);
    setFlipping(true);
    flipTimer.current = setTimeout(() => {
      setActive(index);
      setFlipping(false);
    }, 420);
  };

  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const interval = setInterval(handleNext, 5500);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, total]);

  useEffect(() => () => clearFlipTimer(), []);

  if (!total) return null;

  const stackOffset = (index: number) => {
    return (index - active + total) % total;
  };

  return (
    <div className={cn("mx-auto w-full max-w-[1100px]", className)}>
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        <div
          className="relative mx-auto h-[400px] w-full max-w-[300px] md:mx-0"
          style={{ perspective: "1400px" }}
        >
          {testimonials.map((testimonial, index) => {
            const offset = stackOffset(index);
            const isTop = offset === 0;
            const isVisible = offset <= 3;

            const baseRotate = offset === 1 ? -7 : offset === 2 ? 6 : offset === 3 ? -3 : 0;
            const baseX = offset === 1 ? 16 : offset === 2 ? -14 : offset === 3 ? 8 : 0;
            const baseY = offset * 18;
            const baseScale = 1 - offset * 0.045;

            const flipRotateY =
              flipping && isTop ? (direction === 1 ? -88 : 88) : 0;
            const flipX =
              flipping && isTop ? (direction === 1 ? -120 : 120) : baseX;
            const flipOpacity = flipping && isTop ? 0 : 1 - offset * 0.06;

            return (
              <motion.div
                key={testimonial.name}
                className="absolute inset-0 origin-bottom"
                initial={false}
                animate={{
                  rotateZ: isTop && flipping ? (direction === 1 ? -4 : 4) : baseRotate,
                  rotateY: flipRotateY,
                  x: flipX,
                  y: baseY,
                  scale: baseScale,
                  opacity: isVisible ? flipOpacity : 0,
                  zIndex: total - offset,
                }}
                transition={{
                  duration: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="relative h-full w-full">
                  <CardFace testimonial={testimonial} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex min-h-[340px] flex-col justify-between py-2">
          <motion.div
            key={active}
            initial={{ opacity: 0.6, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <h3 className="font-playfair text-2xl italic text-near-black">
              {current.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-gold">
              {current.designation}
            </p>
            <blockquote className="body-copy mt-8 border-l-2 border-gold/40 pl-5 text-[1.05rem] leading-relaxed text-near-black">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
          </motion.div>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={flipping}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-near-black/15 bg-gradient-to-b from-white to-[#ece8df] shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:from-[#fffdf8] hover:to-[#f0ede4] disabled:opacity-50"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-4 w-4 text-near-black" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={flipping}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-gradient-to-b from-[#222222] to-[#111111] shadow-[0_2px_4px_rgba(0,0,0,0.18)] transition hover:from-[#2a2a2a] hover:to-[#151515] disabled:opacity-50"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
            <div className="ml-2 flex gap-1.5">
              {testimonials.map((item, index) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => goTo(index)}
                  disabled={flipping}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 disabled:opacity-50",
                    index === active
                      ? "w-6 bg-gold"
                      : "w-2 bg-black/15 hover:bg-black/25",
                  )}
                  aria-label={`Go to testimonial from ${item.name}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
