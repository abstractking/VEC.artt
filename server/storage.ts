import { 
  users, type User, type InsertUser,
  collections, type Collection, type InsertCollection,
  nfts, type NFT, type InsertNFT,
  bids, type Bid, type InsertBid,
  transactions, type Transaction, type InsertTransaction
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Collections
  getCollection(id: number): Promise<Collection | undefined>;
  getCollectionsByCreator(creatorId: number): Promise<Collection[]>;
  getAllCollections(): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  
  // NFTs
  getNFT(id: number): Promise<NFT | undefined>;
  getNFTsByOwner(ownerId: number): Promise<NFT[]>;
  getNFTsByCreator(creatorId: number): Promise<NFT[]>;
  getNFTsByCollection(collectionId: number): Promise<NFT[]>;
  getAllNFTs(): Promise<NFT[]>;
  createNFT(nft: InsertNFT): Promise<NFT>;
  updateNFT(id: number, nft: Partial<InsertNFT>): Promise<NFT | undefined>;
  
  // Bids
  getBid(id: number): Promise<Bid | undefined>;
  getBidsByNFT(nftId: number): Promise<Bid[]>;
  getBidsByBidder(bidderId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: number, bid: Partial<InsertBid>): Promise<Bid | undefined>;
  
  // Transactions
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByNFT(nftId: number): Promise<Transaction[]>;
  getTransactionsBySeller(sellerId: number): Promise<Transaction[]>;
  getTransactionsByBuyer(buyerId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress));
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  // Collection methods
  async getCollection(id: number): Promise<Collection | undefined> {
    const [collection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id));
    return collection || undefined;
  }
  
  async getCollectionsByCreator(creatorId: number): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .where(eq(collections.creatorId, creatorId))
      .orderBy(desc(collections.createdAt));
  }
  
  async getAllCollections(): Promise<Collection[]> {
    return await db
      .select()
      .from(collections)
      .orderBy(desc(collections.createdAt));
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(insertCollection)
      .returning();
    return collection;
  }
  
  async updateCollection(id: number, collectionUpdate: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [collection] = await db
      .update(collections)
      .set(collectionUpdate)
      .where(eq(collections.id, id))
      .returning();
    return collection || undefined;
  }
  
  // NFT methods
  async getNFT(id: number): Promise<NFT | undefined> {
    const [nft] = await db
      .select()
      .from(nfts)
      .where(eq(nfts.id, id));
    return nft || undefined;
  }
  
  async getNFTsByOwner(ownerId: number): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .where(eq(nfts.ownerId, ownerId))
      .orderBy(desc(nfts.createdAt));
  }
  
  async getNFTsByCreator(creatorId: number): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .where(eq(nfts.creatorId, creatorId))
      .orderBy(desc(nfts.createdAt));
  }
  
  async getNFTsByCollection(collectionId: number): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .where(eq(nfts.collectionId, collectionId))
      .orderBy(desc(nfts.createdAt));
  }
  
  async getAllNFTs(): Promise<NFT[]> {
    return await db
      .select()
      .from(nfts)
      .orderBy(desc(nfts.createdAt));
  }
  
  async createNFT(insertNFT: InsertNFT): Promise<NFT> {
    const [nft] = await db
      .insert(nfts)
      .values(insertNFT)
      .returning();
    return nft;
  }
  
  async updateNFT(id: number, nftUpdate: Partial<InsertNFT>): Promise<NFT | undefined> {
    const [nft] = await db
      .update(nfts)
      .set(nftUpdate)
      .where(eq(nfts.id, id))
      .returning();
    return nft || undefined;
  }
  
  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    const [bid] = await db
      .select()
      .from(bids)
      .where(eq(bids.id, id));
    return bid || undefined;
  }
  
  async getBidsByNFT(nftId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.nftId, nftId))
      .orderBy(desc(bids.createdAt));
  }
  
  async getBidsByBidder(bidderId: number): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.bidderId, bidderId))
      .orderBy(desc(bids.createdAt));
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const [bid] = await db
      .insert(bids)
      .values(insertBid)
      .returning();
    return bid;
  }
  
  async updateBid(id: number, bidUpdate: Partial<InsertBid>): Promise<Bid | undefined> {
    const [bid] = await db
      .update(bids)
      .set(bidUpdate)
      .where(eq(bids.id, id))
      .returning();
    return bid || undefined;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    return transaction || undefined;
  }
  
  async getTransactionsByNFT(nftId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.nftId, nftId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async getTransactionsBySeller(sellerId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.sellerId, sellerId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async getTransactionsByBuyer(buyerId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.buyerId, buyerId))
      .orderBy(desc(transactions.createdAt));
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }
}

// Export storage instance
export const storage = new DatabaseStorage();
