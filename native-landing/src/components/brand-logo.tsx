import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LOGOS = {
  default: {
    src: "/images/kerygma-social-logo.png",
    width: 930,
    height: 261,
    alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
  light: {
    src: "/images/kerygma-social-logo-light.png",
    width: 451,
    height: 131,
    alt: SITE_NAME,
  },
} as const;

type BrandLogoVariant = "wordmark" | "wordmark-only" | "full" | "mark";
type BrandLogoTone = keyof typeof LOGOS;

type BrandLogoProps = {
  href?: string;
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const variantHeights: Record<BrandLogoVariant, string> = {
  wordmark: "h-10 md:h-12",
  "wordmark-only": "h-9 md:h-10",
  full: "h-12 md:h-14",
  mark: "h-10 w-10",
};

const wordmarkOnlyImageHeights: Record<"sm" | "md", string> = {
  sm: "h-12",
  md: "md:h-[3.25rem]",
};

export function BrandLogo({
  href = "/",
  variant = "wordmark",
  tone = "default",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const logo = LOGOS[tone];
  const heightClass = variantHeights[variant];
  const blendClass = tone === "light" ? "mix-blend-screen" : undefined;

  const image =
    variant === "mark" ? (
      <div className={cn("overflow-hidden rounded-sm", heightClass)}>
        <Image
          src={logo.src}
          alt={SITE_NAME}
          width={logo.width}
          height={logo.height}
          priority={priority}
          className={cn(
            "block h-full w-auto max-w-none object-left object-contain",
            blendClass,
            imageClassName,
          )}
        />
      </div>
    ) : variant === "wordmark-only" ? (
      <div className={cn("overflow-hidden", heightClass)}>
        <Image
          src={logo.src}
          alt={SITE_NAME}
          width={logo.width}
          height={logo.height}
          priority={priority}
          className={cn(
            "block w-auto max-w-none object-left object-top",
            wordmarkOnlyImageHeights.sm,
            wordmarkOnlyImageHeights.md,
            blendClass,
            imageClassName,
          )}
        />
      </div>
    ) : (
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={cn(
          "block w-auto max-w-none object-contain object-left",
          heightClass,
          blendClass,
          imageClassName,
        )}
      />
    );

  if (!href) {
    return <div className={cn("inline-flex shrink-0 items-center", className)}>{image}</div>;
  }

  return (
    <Link href={href} className={cn("inline-flex shrink-0 items-center", className)}>
      {image}
    </Link>
  );
}
