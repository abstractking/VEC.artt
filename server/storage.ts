import { 
  users, type User, type InsertUser,
  collections, type Collection, type InsertCollection,
  nfts, type NFT, type InsertNFT,
  bids, type Bid, type InsertBid,
  transactions, type Transaction, type InsertTransaction 
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private collections: Map<number, Collection>;
  private nfts: Map<number, NFT>;
  private bids: Map<number, Bid>;
  private transactions: Map<number, Transaction>;
  
  private userIdCounter: number;
  private collectionIdCounter: number;
  private nftIdCounter: number;
  private bidIdCounter: number;
  private transactionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.collections = new Map();
    this.nfts = new Map();
    this.bids = new Map();
    this.transactions = new Map();
    
    this.userIdCounter = 1;
    this.collectionIdCounter = 1;
    this.nftIdCounter = 1;
    this.bidIdCounter = 1;
    this.transactionIdCounter = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      user => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Collection methods
  async getCollection(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }
  
  async getCollectionsByCreator(creatorId: number): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(
      collection => collection.creatorId === creatorId
    );
  }
  
  async getAllCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }
  
  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = this.collectionIdCounter++;
    const now = new Date();
    const collection: Collection = { ...insertCollection, id, createdAt: now };
    this.collections.set(id, collection);
    return collection;
  }
  
  async updateCollection(id: number, collectionUpdate: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const updatedCollection = { ...collection, ...collectionUpdate };
    this.collections.set(id, updatedCollection);
    return updatedCollection;
  }
  
  // NFT methods
  async getNFT(id: number): Promise<NFT | undefined> {
    return this.nfts.get(id);
  }
  
  async getNFTsByOwner(ownerId: number): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(
      nft => nft.ownerId === ownerId
    );
  }
  
  async getNFTsByCreator(creatorId: number): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(
      nft => nft.creatorId === creatorId
    );
  }
  
  async getNFTsByCollection(collectionId: number): Promise<NFT[]> {
    return Array.from(this.nfts.values()).filter(
      nft => nft.collectionId === collectionId
    );
  }
  
  async getAllNFTs(): Promise<NFT[]> {
    return Array.from(this.nfts.values());
  }
  
  async createNFT(insertNFT: InsertNFT): Promise<NFT> {
    const id = this.nftIdCounter++;
    const now = new Date();
    const nft: NFT = { ...insertNFT, id, createdAt: now };
    this.nfts.set(id, nft);
    return nft;
  }
  
  async updateNFT(id: number, nftUpdate: Partial<InsertNFT>): Promise<NFT | undefined> {
    const nft = this.nfts.get(id);
    if (!nft) return undefined;
    
    const updatedNFT = { ...nft, ...nftUpdate };
    this.nfts.set(id, updatedNFT);
    return updatedNFT;
  }
  
  // Bid methods
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }
  
  async getBidsByNFT(nftId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.nftId === nftId
    );
  }
  
  async getBidsByBidder(bidderId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(
      bid => bid.bidderId === bidderId
    );
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidIdCounter++;
    const now = new Date();
    const bid: Bid = { ...insertBid, id, createdAt: now };
    this.bids.set(id, bid);
    return bid;
  }
  
  async updateBid(id: number, bidUpdate: Partial<InsertBid>): Promise<Bid | undefined> {
    const bid = this.bids.get(id);
    if (!bid) return undefined;
    
    const updatedBid = { ...bid, ...bidUpdate };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByNFT(nftId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.nftId === nftId
    );
  }
  
  async getTransactionsBySeller(sellerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.sellerId === sellerId
    );
  }
  
  async getTransactionsByBuyer(buyerId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      transaction => transaction.buyerId === buyerId
    );
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = { ...insertTransaction, id, createdAt: now };
    this.transactions.set(id, transaction);
    return transaction;
  }
}

// Export storage instance
export const storage = new MemStorage();
