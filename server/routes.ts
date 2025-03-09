import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertCollectionSchema, insertNftSchema, insertBidSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Helper function to validate request body
function validateRequestBody<T>(schema: z.ZodType<T>, body: any): { data?: T; error?: string } {
  try {
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map(e => `${e.path}: ${e.message}`).join(', ') };
    }
    return { error: 'Invalid data format' };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertUserSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      // Check if user with wallet address already exists
      const existingUser = await storage.getUserByWalletAddress(data.walletAddress);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this wallet address already exists' });
      }

      const user = await storage.createUser(data);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });

  app.get('/api/users/wallet/:address', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve user' });
    }
  });

  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.updateUser(id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Collection routes
  app.post('/api/collections', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertCollectionSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const collection = await storage.createCollection(data);
      res.status(201).json(collection);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create collection' });
    }
  });

  app.get('/api/collections', async (_req: Request, res: Response) => {
    try {
      const collections = await storage.getAllCollections();
      res.json(collections);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve collections' });
    }
  });

  app.get('/api/collections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getCollection(id);
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      res.json(collection);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve collection' });
    }
  });

  app.get('/api/collections/creator/:creatorId', async (req: Request, res: Response) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      const collections = await storage.getCollectionsByCreator(creatorId);
      res.json(collections);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve collections' });
    }
  });

  app.patch('/api/collections/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.updateCollection(id, req.body);
      if (!collection) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      res.json(collection);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update collection' });
    }
  });

  // NFT routes
  app.post('/api/nfts', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertNftSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const nft = await storage.createNFT(data);
      res.status(201).json(nft);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create NFT' });
    }
  });

  app.get('/api/nfts', async (_req: Request, res: Response) => {
    try {
      const nfts = await storage.getAllNFTs();
      res.json(nfts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve NFTs' });
    }
  });

  app.get('/api/nfts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const nft = await storage.getNFT(id);
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }
      res.json(nft);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve NFT' });
    }
  });

  app.get('/api/nfts/owner/:ownerId', async (req: Request, res: Response) => {
    try {
      const ownerId = parseInt(req.params.ownerId);
      const nfts = await storage.getNFTsByOwner(ownerId);
      res.json(nfts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve NFTs' });
    }
  });

  app.get('/api/nfts/creator/:creatorId', async (req: Request, res: Response) => {
    try {
      const creatorId = parseInt(req.params.creatorId);
      const nfts = await storage.getNFTsByCreator(creatorId);
      res.json(nfts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve NFTs' });
    }
  });

  app.get('/api/nfts/collection/:collectionId', async (req: Request, res: Response) => {
    try {
      const collectionId = parseInt(req.params.collectionId);
      const nfts = await storage.getNFTsByCollection(collectionId);
      res.json(nfts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve NFTs' });
    }
  });

  app.patch('/api/nfts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const nft = await storage.updateNFT(id, req.body);
      if (!nft) {
        return res.status(404).json({ error: 'NFT not found' });
      }
      res.json(nft);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update NFT' });
    }
  });

  // Bid routes
  app.post('/api/bids', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertBidSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const bid = await storage.createBid(data);
      res.status(201).json(bid);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create bid' });
    }
  });

  app.get('/api/bids/nft/:nftId', async (req: Request, res: Response) => {
    try {
      const nftId = parseInt(req.params.nftId);
      const bids = await storage.getBidsByNFT(nftId);
      res.json(bids);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve bids' });
    }
  });

  app.get('/api/bids/bidder/:bidderId', async (req: Request, res: Response) => {
    try {
      const bidderId = parseInt(req.params.bidderId);
      const bids = await storage.getBidsByBidder(bidderId);
      res.json(bids);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve bids' });
    }
  });

  app.patch('/api/bids/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const bid = await storage.updateBid(id, req.body);
      if (!bid) {
        return res.status(404).json({ error: 'Bid not found' });
      }
      res.json(bid);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update bid' });
    }
  });

  // Transaction routes
  app.post('/api/transactions', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertTransactionSchema, req.body);
    if (error) return res.status(400).json({ error });

    try {
      const transaction = await storage.createTransaction(data);
      res.status(201).json(transaction);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  app.get('/api/transactions/nft/:nftId', async (req: Request, res: Response) => {
    try {
      const nftId = parseInt(req.params.nftId);
      const transactions = await storage.getTransactionsByNFT(nftId);
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });

  app.get('/api/transactions/seller/:sellerId', async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const transactions = await storage.getTransactionsBySeller(sellerId);
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });

  app.get('/api/transactions/buyer/:buyerId', async (req: Request, res: Response) => {
    try {
      const buyerId = parseInt(req.params.buyerId);
      const transactions = await storage.getTransactionsByBuyer(buyerId);
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve transactions' });
    }
  });

  return httpServer;
}
