"use client";

import { SITE_NAME } from "@/lib/brand";
import { CUSTOMER_TESTIMONIALS } from "@/lib/testimonials";
import { SnapCarousel } from "@/components/ui/snap-carousel";

export function TestimonialsSection() {
  return (
    <section className="bg-cream px-10 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-14 text-center">
          <p className="step-label">Customer stories</p>
          <h2 className="mt-3 font-playfair text-[clamp(1.75rem,3vw,2.5rem)] italic text-near-black">
            What customers say
          </h2>
          <p className="body-copy mx-auto mt-3 max-w-[620px]">
            Real voices from teams using {SITE_NAME} to stay consistent without
            adding another job to the week.
          </p>
        </div>

        <SnapCarousel
          label="Customer testimonials"
          peek={48}
          gap={12}
          prevLabel="Previous testimonial"
          nextLabel="Next testimonial"
          className="mx-auto max-w-[980px]"
        >
          {CUSTOMER_TESTIMONIALS.map((item) => (
            <figure key={item.src} className="m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                width={1200}
                height={675}
                draggable={false}
                className="h-auto w-full rounded-2xl object-cover shadow-card"
              />
              <figcaption className="sr-only">
                {item.name}, {item.designation}
              </figcaption>
            </figure>
          ))}
        </SnapCarousel>
      </div>
    </section>
  );
}
