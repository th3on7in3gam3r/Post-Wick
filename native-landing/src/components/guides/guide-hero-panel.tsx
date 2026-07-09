import type { ReactNode } from "react";

/** Readable hero block on dark marketing watercolor backgrounds. */
export function GuideHeroPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`mx-auto rounded-3xl border border-white/15 bg-[#1A1520]/75 px-6 py-8 text-center shadow-[0_16px_48px_rgba(0,0,0,0.28)] backdrop-blur-md md:px-10 md:py-10 ${className}`}
    >
      {children}
    </header>
  );
}

export const guideHeroTitleClassName =
  "font-playfair text-[clamp(2rem,4vw,3rem)] italic leading-tight text-[#F8F4EC]";

export const guideHeroLeadClassName =
  "mx-auto mt-4 max-w-[640px] text-[1.05rem] font-medium leading-relaxed text-white/90";

export const guideHeroMetaClassName = "mt-3 text-sm text-white/70";
