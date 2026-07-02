"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { TextureButton } from "@/components/ui/texture-button";
import { BIBLEFUNLAND_STUDIOS_URL } from "@/lib/brand";

export function AboutPageClient() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="text-center">
        <h1 className="animate-fade-drop font-playfair text-[clamp(2.25rem,5vw,3.75rem)] italic leading-tight text-near-black drop-shadow-[0_2px_14px_rgba(242,235,217,0.9)]">
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
          We&apos;re Kerygma Social!
        </h1>

        <p className="animate-fade-drop-delay-1 mx-auto mt-5 max-w-[520px] text-[1.05rem] leading-relaxed text-near-black/80">
          <span className="inline-block rounded-md bg-white/80 px-4 py-1 backdrop-blur-sm">
            Meet the founder and learn about our vision for social media on autopilot.
          </span>
        </p>
      </div>

      <div className="animate-fade-drop-delay-2 relative mx-auto mt-12 max-w-[440px]">
        <div className="relative overflow-hidden rounded-lg border-4 border-amber-200/50 bg-white shadow-lg">
          <Image
            src="/images/founder.png"
            alt="Founder of Kerygma Social"
            width={769}
            height={1024}
            sizes="(max-width: 440px) 100vw, 440px"
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <div className="animate-fade-drop-delay-3 mx-auto mt-14 max-w-[640px]">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card sm:p-10">
          <div className="body-copy space-y-5 text-center sm:text-left">
            <p>
              I run{" "}
              <a
                href={BIBLEFUNLAND_STUDIOS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold hover:opacity-80"
              >
                BibleFunLand Studios
              </a>
              , and I kept seeing the same problem: owners with great businesses
              and zero time to post. Agencies cost a fortune. DIY tools still leave
              you staring at a blank caption at 9pm on a Sunday.
            </p>
            <p>
              Kerygma Social is the product I wished existed — drop your URL, let the
              system research your brand, generate a month of posts, and approve
              what feels right. Swipe right. Skip the rest. Publish on autopilot.
            </p>
            <p>
              No fake engagement bait. No generic templates. Just consistent,
              on-brand content for the businesses that keep our neighborhoods
              running — fitness studios, coffee roasters, local shops, and everyone
              in between.
            </p>
            <p>
              Kerygma Social serves businesses of all kinds — from gyms to galleries,
              cafés to churches.
            </p>
          </div>
        </div>

        <section className="mt-14 rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card sm:p-10">
          <p className="step-label">Our mission</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
            Proclaiming the good news every local business already carries
          </h2>
          <div className="body-copy mt-5 space-y-4 sm:text-left">
            <p>
              <strong className="font-medium text-near-black">Kerygma</strong> is a Greek word
              for proclamation — the good news announced aloud so people can hear it and respond.
              Every main-street shop, neighborhood nonprofit, and parish has a kerygma of its own:
              the roast you are proud of, the class that changed someone&apos;s week, the welcome
              that extends beyond Sunday.
            </p>
            <p>
              Social media is where that proclamation happens today. The trouble is not a lack of
              story — it is the lack of time to tell it consistently. Agencies charge fortunes.
              DIY tools leave you staring at a blank caption. Kerygma Social exists so owners can
              proclaim clearly, weekly, in their own voice — without a five-figure retainer or
              midnight Canva sessions.
            </p>
            <p>
              From coffee roasters and yoga studios to community churches, we help locals{" "}
              <strong className="font-medium text-near-black">show up where their neighbors scroll</strong>,
              sound like themselves, and share what matters year-round. Faith communities use
              Kerygma Social to extend welcome, volunteer needs, and ministry stories beyond the
              building. Shops use it to turn daily craft into steady visibility.
            </p>
            <p>
              This is not about replacing human connection or manufacturing hype. It is about
              freeing you to focus on the work only you can do — while the good news of your
              business or ministry keeps going out on autopilot.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
          <TextureButton asChild variant="primary" size="lg">
            <Link href="/sign-up">Try Kerygma Social →</Link>
          </TextureButton>
          <TextureButton asChild variant="accent" size="lg">
            <Link href="/contact">Get in touch</Link>
          </TextureButton>
        </div>
      </div>
    </>
  );
}
