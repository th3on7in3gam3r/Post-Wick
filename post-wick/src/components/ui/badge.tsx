import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-brand-surface text-brand-text border border-brand-border":
            variant === "default",
          "bg-brand-accent-muted text-brand-accent": variant === "accent",
          "bg-brand-border/50 text-brand-muted": variant === "muted",
        },
        className,
      )}
      {...props}
    />
  );
}
