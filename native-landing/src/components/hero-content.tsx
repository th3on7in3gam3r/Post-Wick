"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { TextureButton } from "@/components/ui/texture-button";
import { normalizeWebsiteUrl } from "@/lib/website-url";
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
        <div className="rounded-[4px] bg-[#FDFBF7] p-2.5 shadow-[0_8px_28px_rgba(61,90,69,0.12),0_2px_8px_rgba(0,0,0,0.06)]">
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
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [urlError, setUrlError] = useState("");
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

  function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeWebsiteUrl(websiteUrl);

    if (!normalized) {
      setUrlError("Enter a valid website URL, e.g. yourcompany.com");
      return;
    }

    setUrlError("");
    sessionStorage.setItem("postwick_website_url", normalized);
    router.push(`/sign-up?url=${encodeURIComponent(normalized)}`);
  }

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

        <form
          onSubmit={handleGenerate}
          className="mt-8 w-full max-w-[520px]"
          noValidate
        >
          <div className="flex w-full overflow-hidden rounded-full border border-[#dddddd] bg-white shadow-sm">
            <input
              type="text"
              name="url"
              value={websiteUrl}
              onChange={(event) => {
                setWebsiteUrl(event.target.value);
                if (urlError) setUrlError("");
              }}
              placeholder="yourcompany.com"
              autoComplete="url"
              className="min-w-0 flex-1 bg-transparent px-5 py-[14px] text-left text-base text-near-black outline-none placeholder:text-gray-label"
            />
            <TextureButton type="submit" variant="primary" size="default" className="shrink-0">
              Generate →
            </TextureButton>
          </div>
          {urlError ? (
            <p className="mt-2 text-left text-sm text-[#b45309]">{urlError}</p>
          ) : null}
        </form>

        <p className="mt-3 font-playfair text-[0.9rem] italic text-[#666666]">
          Drop your URL and we&apos;ll generate 50 posts for you.
        </p>
      </div>
    </>
  );
}
