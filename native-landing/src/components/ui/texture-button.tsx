"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariantsOuter = cva(
  "inline-flex transition duration-200 ease-out active:translate-y-px active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "border border-black/20 bg-gradient-to-b from-[#3a3a3a] to-[#111111] p-px shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_2px_4px_rgba(0,0,0,0.18),0_6px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_3px_6px_rgba(0,0,0,0.2),0_8px_20px_rgba(0,0,0,0.1)] active:shadow-[0_1px_2px_rgba(0,0,0,0.2)_inset]",
        accent:
          "border border-[#b87a1f]/40 bg-gradient-to-b from-[#e8b04a] to-[#a87420] p-px shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_2px_4px_rgba(168,116,32,0.35),0_6px_14px_rgba(168,116,32,0.15)] hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_3px_8px_rgba(168,116,32,0.4)]",
        secondary:
          "border border-near-black/15 bg-gradient-to-b from-white to-[#ece8df] p-px shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_3px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_2px_5px_rgba(0,0,0,0.1)] active:shadow-[0_1px_2px_rgba(0,0,0,0.08)_inset]",
        destructive:
          "border border-red-900/20 bg-gradient-to-b from-red-500 to-red-700 p-px shadow-[0_2px_4px_rgba(185,28,28,0.25)]",
        minimal:
          "border border-black/10 bg-gradient-to-b from-white/90 to-[#f0ede4]/90 p-px shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:from-white hover:to-white",
        icon: "rounded-full border border-black/10 bg-gradient-to-b from-white to-[#ece8df] p-px shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-xl",
      },
      size: {
        sm: "",
        default: "",
        lg: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "pill",
      size: "default",
    },
  },
);

const innerDivVariants = cva(
  "flex h-full w-full items-center justify-center font-medium transition duration-200 ease-out",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-b from-[#222222] to-[#111111] text-white/95 hover:from-[#2a2a2a] hover:to-[#151515] active:from-[#111111] active:to-[#0a0a0a]",
        accent:
          "bg-gradient-to-b from-gold to-[#a87420] text-white hover:from-[#d4a043] hover:to-[#9a6818] active:from-[#b8872e] active:to-[#8f6418]",
        secondary:
          "bg-gradient-to-b from-[#fafaf7] to-[#ece8df] text-near-black hover:from-white hover:to-[#f5f2eb] active:from-[#ece8df] active:to-[#e5e0d5]",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-white hover:from-red-400 hover:to-red-500",
        minimal:
          "bg-gradient-to-b from-white to-[#f7f4ec] text-near-black hover:from-[#fffdf8] hover:to-[#f0ede4]",
        icon: "rounded-full bg-gradient-to-b from-white to-[#f0ede4] text-near-black",
      },
      shape: {
        pill: "rounded-full",
        rounded: "rounded-[10px]",
      },
      size: {
        sm: "gap-1.5 px-4 py-1.5 text-xs",
        default: "gap-2 px-5 py-2 text-sm",
        lg: "gap-2 px-6 py-3 text-base",
        icon: "p-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      shape: "pill",
      size: "default",
    },
  },
);

export interface TextureButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariantsOuter> {
  asChild?: boolean;
}

const TextureButton = React.forwardRef<HTMLButtonElement, TextureButtonProps>(
  (
    {
      children,
      variant = "primary",
      shape = "pill",
      size = "default",
      asChild = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const outerClass = cn(
      buttonVariantsOuter({ variant, shape, size }),
      disabled && "pointer-events-none cursor-not-allowed opacity-50",
      className,
    );
    const innerClass = cn(innerDivVariants({ variant, shape, size }));

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return (
        <span className={outerClass}>
          {React.cloneElement(child, {
            className: cn(innerClass, child.props.className),
          })}
        </span>
      );
    }

    return (
      <button className={outerClass} ref={ref} disabled={disabled} {...props}>
        <div className={innerClass}>{children}</div>
      </button>
    );
  },
);

TextureButton.displayName = "TextureButton";

export { TextureButton, buttonVariantsOuter, innerDivVariants };
