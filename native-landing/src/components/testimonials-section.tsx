"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const testimonials = [
  {
    quote:
      "I used to block out Sunday nights for captions. Now I swipe through a month of posts in ten minutes and Post-Wick handles the rest.",
    name: "Maya Torres",
    designation: "Owner · Ember & Oak Coffee",
    initials: "MT",
    accent: "from-[#8B5E3C] to-[#5C3D28]",
    src: "/images/testimonials/maya-torres.svg",
  },
  {
    quote:
      "Our gym finally posts consistently — class promos, member wins, the lot. It sounds like us, not a generic marketing bot.",
    name: "James Okonkwo",
    designation: "Founder · CrossFit Southside",
    initials: "JO",
    accent: "from-[#2F4F4F] to-[#1A2E2E]",
    src: "/images/testimonials/james-okonkwo.svg",
  },
  {
    quote:
      "Post-Wick picked up our tone from the website alone. Seasonal arrangements, workshop dates, thank-you posts — all on brand.",
    name: "Priya Desai",
    designation: "Owner · Bloom Floral Studio",
    initials: "PD",
    accent: "from-[#B87A9A] to-[#7A4F66]",
    src: "/images/testimonials/priya-desai.svg",
  },
  {
    quote:
      "I'm not hiring a social manager for a studio our size. Approve what works, skip what doesn't — that's the whole workflow.",
    name: "Rachel Kim",
    designation: "Owner · Harbor Pilates",
    initials: "RK",
    accent: "from-[#6B8F71] to-[#3D5240]",
    src: "/images/testimonials/rachel-kim.svg",
  },
  {
    quote:
      "Before-and-after posts, booking reminders, local promos — it's running while I'm actually detailing cars. Worth every penny.",
    name: "Tom Alvarez",
    designation: "Owner · Alvarez Auto Detail",
    initials: "TA",
    accent: "from-[#4A6670] to-[#2A3A40]",
    src: "/images/testimonials/tom-alvarez.svg",
  },
  {
    quote:
      "Drop your URL, review the posts, approve what fits — and get back to work. That's the whole idea.",
    name: "Biblefunland Studios",
    designation: "Built Post-Wick · Founder",
    initials: "BF",
    accent: "from-gold to-[#a87420]",
    src: "/images/founder.png",
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
            Example stories from owners like you — plus why we built Post-Wick at
            Biblefunland Studios.
          </p>
        </div>

        <AnimatedTestimonials testimonials={testimonials} autoplay />
      </div>
    </section>
  );
}
