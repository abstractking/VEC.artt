import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  bio: text("bio"),
  isVerified: boolean("is_verified").default(false),
  verificationRequestDate: timestamp("verification_request_date"),
  verificationApprovedDate: timestamp("verification_approved_date"),
  socialLinks: jsonb("social_links").default({}),
  favorites: jsonb("favorites").default([]),
  stats: jsonb("stats").default({
    totalViews: 0,
    totalLikes: 0,
    totalSales: 0,
    totalRevenue: "0",
    totalNFTs: 0,
    createdNFTs: 0,
    ownedNFTs: 0,
    collections: 0
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

// Collections model
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: integer("creator_id").notNull(),
  coverImage: text("cover_image"),
  floorPrice: text("floor_price"),
  volumeTraded: text("volume_traded"),
  itemCount: integer("item_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true
});

// NFT model
export const nfts = pgTable("nfts", {
  id: serial("id").primaryKey(),
  tokenId: text("token_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  creatorId: integer("creator_id").notNull(),
  ownerId: integer("owner_id").notNull(),
  collectionId: integer("collection_id"),
  price: text("price"),
  currency: text("currency").default("VET"),
  isForSale: boolean("is_for_sale").default(false),
  isBiddable: boolean("is_biddable").default(false),
  metadataHash: text("metadata_hash"),
  metadata: jsonb("metadata"),
  royaltyPercentage: text("royalty_percentage").default("0"),
  collaborators: jsonb("collaborators").default({}),
  tags: jsonb("tags").default([]),
  isEdited: boolean("is_edited").default(false),
  lastEditedAt: timestamp("last_edited_at"),
  // Transaction-related fields
  lastSoldPrice: text("last_sold_price"),
  lastSoldAt: timestamp("last_sold_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNftSchema = createInsertSchema(nfts).omit({
  id: true,
  createdAt: true
});

// Bids model
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  nftId: integer("nft_id").notNull(),
  bidderId: integer("bidder_id").notNull(),
  amount: text("amount").notNull(),
  currency: text("currency").default("VET"),
  status: text("status").default("active"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true
});

// Transactions model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  nftId: integer("nft_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  price: text("price").notNull(),
  currency: text("currency").default("VET"),
  txHash: text("tx_hash").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof insertCollectionSchema>;

export type NFT = typeof nfts.$inferSelect;
export type InsertNFT = z.infer<typeof insertNftSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
