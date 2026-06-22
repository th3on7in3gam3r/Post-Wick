import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO = {
  src: "/images/post-wick-logo.png",
  width: 929,
  height: 268,
  alt: "Post-Wick — Social media on autopilot",
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
  wordmark: "h-8 md:h-9",
  full: "h-10 md:h-11",
  mark: "h-9 w-9",
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
          alt="Post-Wick"
          width={LOGO.width}
          height={LOGO.height}
          priority={priority}
          className={cn("block h-full w-auto max-w-none object-left", imageClassName)}
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
