import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LOGO = {
  src: "/images/kerygma-social-logo.png",
  width: 1021,
  height: 244,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
} as const;

type BrandLogoVariant = "wordmark" | "full" | "mark";

type BrandLogoProps = {
  href?: string;
  variant?: BrandLogoVariant;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

const variantHeights: Record<BrandLogoVariant, string> = {
  wordmark: "h-10 md:h-12",
  full: "h-12 md:h-14",
  mark: "h-10 w-10",
};

export function BrandLogo({
  href = "/",
  variant = "wordmark",
  className,
  imageClassName,
  priority = false,
}: BrandLogoProps) {
  const heightClass = variantHeights[variant];

  const image =
    variant === "mark" ? (
      <div className={cn("overflow-hidden rounded-sm", heightClass)}>
        <Image
          src={LOGO.src}
          alt={SITE_NAME}
          width={LOGO.width}
          height={LOGO.height}
          priority={priority}
          className={cn("block h-full w-auto max-w-none object-left object-contain", imageClassName)}
        />
      </div>
    ) : (
      <Image
        src={LOGO.src}
        alt={LOGO.alt}
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        className={cn("block w-auto max-w-none object-contain object-left", heightClass, imageClassName)}
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
