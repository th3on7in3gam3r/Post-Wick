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
          We&apos;re Kerygma Social!
        </h1>

        <p className="body-copy animate-fade-drop-delay-1 mx-auto mt-5 max-w-[520px] text-[1.05rem]">
          Meet the founder and learn about our vision for social media on autopilot.
        </p>
      </div>

      <div className="animate-fade-drop-delay-2 relative mx-auto mt-12 max-w-[440px]">
        <div className="relative overflow-hidden rounded-2xl bg-[#fef6c8] shadow-card">
          <Image
            src="/images/founder.png"
            alt="Founder of Kerygma Social"
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

        <section className="mt-14 rounded-2xl border border-black/[0.06] bg-white p-8 shadow-card sm:p-10">
          <p className="step-label">Our mission</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.25rem)] italic text-near-black">
            Serving local businesses everywhere and the faith communities that anchor them
          </h2>
          <div className="body-copy mt-5 space-y-4 sm:text-left">
            <p>
              We believe every main-street shop, neighborhood nonprofit, and parish deserves
              the same caliber of social media that national chains buy from agencies — without
              the five-figure retainer. Kerygma Social exists to democratize{" "}
              <strong className="font-medium text-near-black">AI social media marketing</strong>{" "}
              for owners who would rather serve customers than stare at Canva at midnight.
            </p>
            <p>
              From family restaurants and home-service contractors to yoga studios and
              community churches, our mission is simple: help{" "}
              <strong className="font-medium text-near-black">local businesses post consistently</strong>,
              sound like themselves, and show up where their neighbors already scroll. Faith
              communities use Kerygma Social to extend welcome beyond Sunday — sharing events,
              volunteer needs, and stories that reflect their values year-round.
            </p>
            <p>
              We are building for the long tail of American entrepreneurship — the places you
              recommend to friends, the ministries you trust, the brands that make your town
              feel like home. Social media on autopilot is not about replacing human connection;
              it is about freeing you to focus on the work only you can do.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
          <TextureButton asChild variant="primary" size="lg">
            <Link href="/sign-up">Try Kerygma Social →</Link>
          </TextureButton>
          <TextureButton asChild variant="secondary" size="lg">
            <Link href="/contact">Get in touch</Link>
          </TextureButton>
        </div>
      </div>
    </>
  );
}
