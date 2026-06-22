import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PLATFORM_CHAR_LIMITS = {
  linkedin: 3000,
  twitter: 280,
  instagram: 2200,
  facebook: 63206,
  tiktok: 2200,
} as const;

export type Platform = keyof typeof PLATFORM_CHAR_LIMITS;
