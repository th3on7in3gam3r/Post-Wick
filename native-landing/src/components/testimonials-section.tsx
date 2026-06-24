"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "Our gym finally posts consistently — class promos, member wins, the lot. It sounds like us, not a generic marketing bot.",
    name: "James Okonkwo",
    designation: "Founder · CrossFit Southside",
    src: "/images/testimonials/james-okonkwo.jpg",
  },
  {
    quote:
      "I used to lose Sunday nights writing Instagram captions. Now I approve a month of latte specials and slow-morning posts in about ten minutes.",
    name: "Maya Torres",
    designation: "Owner · Ember & Oak Coffee",
    src: "/images/testimonials/maya-torres.jpg",
  },
  {
    quote:
      "Before-and-afters and booking reminders hit Instagram while I'm behind the chair. I clear the week's queue on my lunch break — usually fifteen minutes.",
    name: "Aisha Williams",
    designation: "Owner · Strand Hair Co.",
    src: "/images/testimonials/aisha-williams.jpg",
  },
  {
    quote:
      "We're posting workshop dates and Valentine's arrangements on Facebook again. I used to go quiet for weeks — now something's scheduled every few days.",
    name: "Priya Desai",
    designation: "Owner · Bloom Floral Studio",
    src: "/images/testimonials/priya-desai.jpg",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-14 text-center">
          <p className="step-label">Testimonials</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            Owners who stopped dreading social media
          </h2>
          <p className="body-copy mx-auto mt-3 max-w-[560px]">
            Real results from local business owners who put social media on autopilot.
          </p>
        </div>

        <AnimatedTestimonials testimonials={testimonials} autoplay />
      </div>
    </section>
  );
}
