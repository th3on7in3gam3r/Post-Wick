import { cn } from "@/lib/utils";

const SIZE_CONFIG = {
  sm: { box: "h-8 w-8", border: "border-2", dot: "h-1.5 w-1.5" },
  md: { box: "h-[4.5rem] w-[4.5rem]", border: "border-[3px]", dot: "h-2.5 w-2.5" },
  lg: { box: "h-20 w-20", border: "border-[3px]", dot: "h-3 w-3" },
} as const;

type BrandLoaderRingProps = {
  size?: keyof typeof SIZE_CONFIG;
  className?: string;
};

export function BrandLoaderRing({ size = "md", className }: BrandLoaderRingProps) {
  const { box, border, dot } = SIZE_CONFIG[size];

  return (
    <div className={cn("relative flex items-center justify-center", box, className)} aria-hidden>
      <div className={cn("absolute inset-0 rounded-full border-gold/15", border)} />
      <div
        className={cn(
          "absolute inset-0 animate-spin rounded-full border-transparent border-t-gold border-r-gold/50",
          border,
        )}
        style={{ animationDuration: "1.1s" }}
      />
      <div
        className={cn(
          "animate-pulse rounded-full bg-gold shadow-[0_0_14px_rgba(184,122,31,0.5)]",
          dot,
        )}
      />
    </div>
  );
}

type BrandLoaderProps = {
  label?: string;
  size?: keyof typeof SIZE_CONFIG;
  className?: string;
};

export function BrandLoader({ label = "Loading…", size = "md", className }: BrandLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <BrandLoaderRing size={size} />
      {label ? <p className="text-sm font-medium text-gray-body">{label}</p> : null}
    </div>
  );
}
