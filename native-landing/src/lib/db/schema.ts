import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  websiteUrl: text("website_url").notNull(),
  description: text("description"),
  crawlStatus: text("crawl_status").notNull().default("pending"),
  researchData: text("research_data"),
  postingFrequency: integer("posting_frequency").notNull().default(3),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: "string" }),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }),
  externalPostId: text("external_post_id"),
  publishError: text("publish_error"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const connections = pgTable(
  "connections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    accountName: text("account_name"),
    accessToken: text("access_token"),
    metadata: text("metadata"),
    isDemo: boolean("is_demo").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    brandPlatformIdx: uniqueIndex("connections_brand_platform_idx").on(
      table.brandId,
      table.platform,
    ),
  }),
);

export const metaOauthPending = pgTable(
  "meta_oauth_pending",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(),
    pagesData: text("pages_data").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userBrandPlatformIdx: uniqueIndex("meta_oauth_pending_user_brand_platform_idx").on(
      table.userId,
      table.brandId,
      table.platform,
    ),
  }),
);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  subscriptionTier: text("subscription_tier").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  timezone: text("timezone").notNull().default("America/New_York"),
  defaultPostingFrequency: integer("default_posting_frequency").notNull().default(3),
  notifyQueue: boolean("notify_queue").notNull().default(true),
  notifyPublish: boolean("notify_publish").notNull().default(true),
  notifyWeeklyDigest: boolean("notify_weekly_digest").notNull().default(false),
  demoModeEnabled: boolean("demo_mode_enabled").notNull().default(false),
  profileOnboardingCompleted: boolean("profile_onboarding_completed").notNull().default(false),
  displayName: text("display_name"),
  referralSource: text("referral_source"),
  referralDetail: text("referral_detail"),
  refineUsageCount: integer("refine_usage_count").notNull().default(0),
  refineUsagePeriod: text("refine_usage_period"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});
