import { GENERATE_PLATFORMS } from "@/lib/platforms";
import {
  estimatedMonthlyAutopilotPosts,
  PLAN_LIMITS,
} from "@/lib/plans";
import { plans } from "@/lib/pricing";

export const ACTIVE_SOCIAL_PLATFORMS = GENERATE_PLATFORMS;
export const PLATFORMS_PER_BRAND = ACTIVE_SOCIAL_PLATFORMS.length;

export const planFacts = {
  free: {
    batch: PLAN_LIMITS.free.generateMax,
    weekly: PLAN_LIMITS.free.postsPerWeek,
    monthlyPosts: estimatedMonthlyAutopilotPosts("free"),
  },
  pro: {
    batch: PLAN_LIMITS.pro.generateMax,
    weekly: PLAN_LIMITS.pro.postsPerWeek,
    monthlyPosts: estimatedMonthlyAutopilotPosts("pro"),
    monthlyPrice: plans.pro.monthly,
    yearlyPerMonth: plans.pro.yearlyPerMonth,
  },
  max: {
    batch: PLAN_LIMITS.max.generateMax,
    weekly: PLAN_LIMITS.max.postsPerWeek,
    monthlyPosts: estimatedMonthlyAutopilotPosts("max"),
    monthlyPrice: plans.max.monthly,
    yearlyPerMonth: plans.max.yearlyPerMonth,
  },
} as const;

export const SCHEDULE_SLOT_DAYS = "Monday, Wednesday, and Friday";
export const SCHEDULE_SLOT_TIME = "10:00 AM";
