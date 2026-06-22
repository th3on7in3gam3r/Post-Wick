"use client";

import { Typewriter } from "@/components/ui/typewriter-text";

const LABEL = "How it works";
const HEADING = "See how Post-Wick works in four steps.";

export function HowItWorksHeading() {
  const headingStartDelay = LABEL.length * 55 + 400;

  return (
    <div className="text-center">
      <p className="step-label min-h-[1.25rem]">
        <Typewriter text={LABEL} speed={55} loop={false} cursor="" />
      </p>
      <h2 className="mx-auto mt-3 min-h-[1.2em] max-w-[720px] font-playfair text-[clamp(2rem,4vw,3rem)] italic text-near-black">
        <Typewriter
          text={HEADING}
          speed={42}
          loop={false}
          startDelay={headingStartDelay}
        />
      </h2>
    </div>
  );
}
