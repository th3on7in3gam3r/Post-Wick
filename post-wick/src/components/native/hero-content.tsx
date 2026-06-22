"use client";

import Link from "next/link";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  type ImagePlacement,
  type Industry,
  industries,
  industryImages,
  randomImagePlacement,
} from "@/lib/industries";

function TypingIndustry({
  onIndustryChange,
}: {
  onIndustryChange: (industry: Industry, placement: ImagePlacement) => void;
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const controls = useAnimationControls();

  const currentIndustry = industries[currentWordIndex];

  useEffect(() => {
    onIndustryChange(currentIndustry, randomImagePlacement());
  }, [currentIndustry, onIndustryChange]);

  useEffect(() => {
    const word = industries[currentWordIndex];

    if (isDeleting) {
      if (currentText === "") {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % industries.length);
        return;
      }

      const timer = setTimeout(() => {
        setCurrentText(word.substring(0, currentText.length - 1));
      }, 45);
      return () => clearTimeout(timer);
    }

    if (currentText === word) {
      const timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setCurrentText(word.substring(0, currentText.length + 1));
    }, 80);
    return () => clearTimeout(timer);
  }, [currentText, currentWordIndex, isDeleting]);

  useEffect(() => {
    controls.start({
      opacity: [1, 0.2],
      transition: {
        duration: 0.55,
        repeat: Infinity,
        repeatType: "reverse",
      },
    });
  }, [controls]);

  return (
    <span className="inline-block italic text-gold text-center" aria-live="polite">
      {currentText}
      <motion.span animate={controls} className="ml-0.5 font-light text-gold">
        |
      </motion.span>
    </span>
  );
}

function HeroIndustryImage({
  industry,
  placement,
}: {
  industry: Industry;
  placement: ImagePlacement;
}) {
  const image = industryImages[industry];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={industry}
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -8 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="pointer-events-none absolute z-10 hidden w-[160px] md:block lg:w-[190px]"
        style={{
          top: placement.top,
          left: placement.left,
          rotate: `${placement.rotate}deg`,
        }}
      >
        <div className="rounded-[4px] bg-white p-2.5 shadow-polaroid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            className="aspect-[4/5] w-full rounded-[2px] object-cover"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function HeroContent() {
  const [activeIndustry, setActiveIndustry] = useState<Industry>(industries[0]);
  const [placement, setPlacement] = useState<ImagePlacement>(() =>
    randomImagePlacement(),
  );

  const handleIndustryChange = useCallback(
    (industry: Industry, nextPlacement: ImagePlacement) => {
      setActiveIndustry(industry);
      setPlacement(nextPlacement);
    },
    [],
  );

  return (
    <>
      <HeroIndustryImage industry={activeIndustry} placement={placement} />

      <div className="relative z-20 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1400px] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-playfair text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.08] text-near-black">
          Social media <em className="italic text-near-black">for</em>
          <br />
          <TypingIndustry onIndustryChange={handleIndustryChange} />
        </h1>

        <p className="mt-4 font-playfair text-[1.3rem] italic text-[#555555]">
          Get more customers on autopilot.
        </p>

        <div className="mt-8 flex w-full max-w-[520px] overflow-hidden rounded-full border border-[#dddddd] bg-white shadow-sm">
          <input
            type="text"
            placeholder="yourcompany.com"
            className="min-w-0 flex-1 bg-transparent px-5 py-[14px] text-left text-base text-near-black outline-none placeholder:text-gray-label"
          />
          <Link
            href="/sign-up"
            className="shrink-0 bg-native-black px-6 py-[14px] text-base font-medium text-white transition hover:bg-black"
          >
            Generate →
          </Link>
        </div>

        <p className="mt-3 font-playfair text-[0.9rem] italic text-[#666666]">
          Drop your URL and we&apos;ll generate 50 posts for you.
        </p>
      </div>
    </>
  );
}
