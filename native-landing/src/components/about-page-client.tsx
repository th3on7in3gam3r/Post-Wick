"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TextureButton } from "@/components/ui/texture-button";

export function AboutPageClient() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="text-center">
        <h1 className="animate-fade-drop font-playfair text-[clamp(2.25rem,5vw,3.75rem)] italic leading-tight text-near-black">
          Hi{" "}
          <motion.span
            className="inline-block origin-[70%_70%]"
            aria-hidden
            animate={{ rotate: [0, 18, -12, 18, 0] }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2.2,
            }}
          >
            👋
          </motion.span>{" "}
          We&apos;re Post-Wick!
        </h1>

        <p className="body-copy animate-fade-drop-delay-1 mx-auto mt-5 max-w-[520px] text-[1.05rem]">
          Meet the founder and learn about our vision for social media on autopilot.
        </p>
      </div>

      <div className="animate-fade-drop-delay-2 relative mx-auto mt-12 max-w-[440px]">
        <div className="relative overflow-hidden rounded-2xl bg-[#fef6c8] shadow-card">
          <Image
            src="/images/founder.png"
            alt="Founder of Post-Wick"
            width={769}
            height={1024}
            sizes="(max-width: 440px) 100vw, 440px"
            className="h-auto w-full"
            priority
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cream via-cream/70 to-transparent" />
        </div>
      </div>

      <div className="animate-fade-drop-delay-3 mx-auto mt-14 max-w-[640px]">
        <div className="body-copy space-y-5 text-center sm:text-left">
          <p>
            I run{" "}
            <a
              href="https://biblefunlandstudio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gold hover:opacity-80"
            >
              Biblefunland Studios
            </a>
            , and I kept seeing the same problem: owners with great businesses
            and zero time to post. Agencies cost a fortune. DIY tools still leave
            you staring at a blank caption at 9pm on a Sunday.
          </p>
          <p>
            Post-Wick is the product I wished existed — drop your URL, let the
            system research your brand, generate a month of posts, and approve
            what feels right. Swipe right. Skip the rest. Publish on autopilot.
          </p>
          <p>
            No fake engagement bait. No generic templates. Just consistent,
            on-brand content for the businesses that keep our neighborhoods
            running — fitness studios, coffee roasters, local shops, and everyone
            in between.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
          <TextureButton asChild variant="primary" size="lg">
            <Link href="/sign-up">Try Post-Wick →</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg">
            <Link href="/contact">Get in touch</Link>
          </TextureButton>
        </div>
      </div>
    </>
  );
}
