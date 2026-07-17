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
  isPublic: boolean("is_public").notNull().default(false),
  publicSlug: text("public_slug"),
  publicNiche: text("public_niche"),
  postwickAutoShare: boolean("postwick_auto_share").notNull().default(false),
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
  isPublic: boolean("is_public").notNull().default(false),
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
  agencyId: text("agency_id"),
  referredByAgencyId: text("referred_by_agency_id"),
  refineUsageCount: integer("refine_usage_count").notNull().default(0),
  refineUsagePeriod: text("refine_usage_period"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const agencies = pgTable(
  "agencies",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id").notNull(),
    name: text("name").notNull(),
    contactEmail: text("contact_email"),
    referralCode: text("referral_code").notNull(),
    status: text("status").notNull().default("active"),
    whiteLabelName: text("white_label_name"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    ownerIdx: uniqueIndex("agencies_owner_user_id_idx").on(table.ownerUserId),
    referralCodeIdx: uniqueIndex("agencies_referral_code_idx").on(table.referralCode),
  }),
);

export const affiliateReferrals = pgTable(
  "affiliate_referrals",
  {
    id: text("id").primaryKey(),
    agencyId: text("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    referredUserId: text("referred_user_id").notNull(),
    signupAt: timestamp("signup_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    convertedAt: timestamp("converted_at", { withTimezone: true, mode: "string" }),
    subscriptionTier: text("subscription_tier"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    referredUserIdx: uniqueIndex("affiliate_referrals_referred_user_id_idx").on(
      table.referredUserId,
    ),
  }),
);

/** AT Protocol OAuth transient state (CSRF / PKCE / DPoP during authorize). */
export const blueskyOauthState = pgTable("bluesky_oauth_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

/** AT Protocol OAuth sessions keyed by user DID. */
export const blueskyOauthSession = pgTable("bluesky_oauth_session", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

/** Partner API keys for Cadence / growth-stack integrations (hash only stored). */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull().default("Cadence"),
    keyPrefix: text("key_prefix").notNull(),
    keyHash: text("key_hash").notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    keyHashIdx: uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
  }),
);
