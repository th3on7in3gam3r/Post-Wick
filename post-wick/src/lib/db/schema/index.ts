import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const postStatusEnum = pgEnum("post_status", [
  "pending",
  "approved",
  "skipped",
  "published",
  "failed",
]);

export const platformEnum = pgEnum("platform", [
  "linkedin",
  "twitter",
  "instagram",
  "facebook",
  "tiktok",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "max",
]);

export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  websiteUrl: text("website_url").notNull(),
  description: text("description"),
  researchData: jsonb("research_data"),
  postingFrequency: integer("posting_frequency").default(3).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  status: postStatusEnum("status").default("pending").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  externalPostId: varchar("external_post_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const socialConnections = pgTable("social_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  brandId: uuid("brand_id")
    .notNull()
    .references(() => brands.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  accountName: varchar("account_name", { length: 255 }),
  encryptedAccessToken: text("encrypted_access_token").notNull(),
  encryptedRefreshToken: text("encrypted_refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const brandsRelations = relations(brands, ({ many }) => ({
  posts: many(posts),
  socialConnections: many(socialConnections),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  brand: one(brands, {
    fields: [posts.brandId],
    references: [brands.id],
  }),
}));

export const socialConnectionsRelations = relations(
  socialConnections,
  ({ one }) => ({
    brand: one(brands, {
      fields: [socialConnections.brandId],
      references: [brands.id],
    }),
  }),
);
