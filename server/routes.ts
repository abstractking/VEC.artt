import expressModule, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import path from 'path';
import { fileURLToPath } from 'url';

const express = expressModule;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { insertUserSchema, insertCollectionSchema, insertNftSchema, insertBidSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import fetch from "node-fetch";
import path from 'path'; // Import path module

// Define WebSocket connection types
interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

// Store connected clients
const connectedClients = new Map<number, WebSocketClient[]>();

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

// Helper functions for notifications
function sendNotification(userId: number | null, notification: any) {
  if (userId) {
    // Send to specific user
    const userClients = connectedClients.get(userId);
    if (userClients && userClients.length > 0) {
      const message = JSON.stringify({
        type: 'notification',
        ...notification
      });

      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  } else {
    // Broadcast to all connected clients
    const allClients: WebSocketClient[] = [];
    connectedClients.forEach(clients => {
      // Add each client individually without using spread operator
      for (let i = 0; i < clients.length; i++) {
        allClients.push(clients[i]);
      }
    });

    const message = JSON.stringify({
      type: 'notification',
      ...notification
    });

    allClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

// Function to generate unique ID for notifications
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server with explicit path
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true
  });

  // Handle WebSocket connections
  wss.on('connection', (ws: WebSocketClient) => {
    ws.isAlive = true;
    console.log('WebSocket client connected');

    // Send immediate confirmation to the client
    try {
      ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        timestamp: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error sending connection confirmation:', err);
    }

    // Handle messages from client
    ws.on('message', (message) => {
      try {
        // Convert buffer to string if necessary
        const messageStr = message instanceof Buffer ? message.toString() : message.toString();
        const data = JSON.parse(messageStr);

        // Handle authentication
        if (data.type === 'auth' && data.userId) {
          const userId = parseInt(data.userId);
          ws.userId = userId;

          // Add client to connected clients map
          if (!connectedClients.has(userId)) {
            connectedClients.set(userId, []);
          }
          connectedClients.get(userId)!.push(ws);

          console.log(`WebSocket client authenticated: User #${userId}`);

          // Send welcome notification
          try {
            ws.send(JSON.stringify({
              type: 'notification',
              id: generateId(),
              notificationType: 'system',
              message: 'Welcome to VeCollab! You will receive real-time notifications here.',
              timestamp: new Date().toISOString()
            }));
          } catch (err) {
            console.error('Error sending welcome notification:', err);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    // Handle disconnections
    ws.on('close', () => {
      if (ws.userId) {
        const userClients = connectedClients.get(ws.userId);
        if (userClients) {
          // Remove this client from the user's client list
          const index = userClients.indexOf(ws);
          if (index !== -1) {
            userClients.splice(index, 1);
          }

          // If no clients left for this user, remove the user entry
          if (userClients.length === 0) {
            connectedClients.delete(ws.userId);
          }
        }
      }

      console.log('WebSocket client disconnected');
    });

    // Handle pings to keep connection alive
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Ping clients periodically to check if they're still alive
  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      const client = ws as WebSocketClient;
      if (client.isAlive === false) {
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 30000); // Check every 30 seconds

  wss.on('close', () => {
    clearInterval(interval);
  });

  // User routes
  app.post('/api/users', async (req: Request, res: Response) => {
    const { data, error } = validateRequestBody(insertUserSchema, req.body);
    if (error || !data) return res.status(400).json({ error: error || 'Invalid user data' });

    try {
      // Check if user with wallet address already exists
      const existingUser = await storage.getUserByWalletAddress(data.walletAddress);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this wallet address already exists' });
      }

      const user = await storage.createUser(data);

      // Send notification about new user registration
      sendNotification(null, {
        id: generateId(),
        notificationType: 'system',
        message: `New creator ${data.username} joined the platform!`,
        timestamp: new Date().toISOString(),
        link: `/profile/${user.id}`
      });

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
    if (error || !data) return res.status(400).json({ error: error || 'Invalid collection data' });

    try {
      const collection = await storage.createCollection(data);

      // Send notification about new collection
      sendNotification(null, {
        id: generateId(),
        notificationType: 'mint',
        message: `New collection "${data.name}" has been created!`,
        timestamp: new Date().toISOString(),
        link: `/collections/${collection.id}`
      });

      // Send personalized notification to the creator
      sendNotification(data.creatorId, {
        id: generateId(),
        notificationType: 'mint',
        message: `Your collection "${data.name}" has been created successfully!`,
        timestamp: new Date().toISOString(),
        link: `/collections/${collection.id}`
      });

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
    if (error || !data) return res.status(400).json({ error: error || 'Invalid NFT data' });

    try {
      const nft = await storage.createNFT(data);

      // Fetch creator info for notification message
      const creator = await storage.getUser(data.creatorId);
      const creatorName = creator ? creator.username : `Artist #${data.creatorId}`;

      // Send global notification for new NFT mint
      sendNotification(null, {
        id: generateId(),
        notificationType: 'mint',
        message: `${creatorName} just minted "${data.name}" NFT!`,
        timestamp: new Date().toISOString(),
        link: `/nft/${nft.id}`,
        thumbnail: data.imageUrl
      });

      // If the NFT is part of a collection, send notification to collection followers
      if (data.collectionId) {
        // In a real implementation we would fetch collection followers here
        // For now, we'll just send to the collection creator
        const collection = await storage.getCollection(data.collectionId);
        if (collection) {
          sendNotification(collection.creatorId, {
            id: generateId(),
            notificationType: 'mint',
            message: `New NFT "${data.name}" added to your collection "${collection.name}"`,
            timestamp: new Date().toISOString(),
            link: `/nft/${nft.id}`,
            thumbnail: data.imageUrl
          });
        }
      }

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

      // Track view if userId is provided
      if (req.query.userId) {
        try {
          const userId = parseInt(req.query.userId as string);
          // Don't increment view count if viewing own NFT
          if (nft.creatorId !== userId) {
            // Update creator stats to increment view count
            const creator = await storage.getUser(nft.creatorId);
            if (creator) {
              // TypeScript needs help with the jsonb type inference
              type UserStats = {
                totalViews: number;
                totalLikes: number;
                totalSales: number;
                totalRevenue: string;
                totalNFTs: number;
                createdNFTs: number;
                ownedNFTs: number;
                collections: number;
              };

              const currentStats = (creator.stats as UserStats) || { 
                totalViews: 0, 
                totalLikes: 0, 
                totalSales: 0, 
                totalRevenue: "0",
                totalNFTs: 0,
                createdNFTs: 0,
                ownedNFTs: 0,
                collections: 0
              };

              await storage.updateUser(nft.creatorId, {
                stats: {
                  ...currentStats,
                  totalViews: (currentStats.totalViews || 0) + 1
                }
              });

              // Send notification to creator about the view
              sendNotification(nft.creatorId, {
                id: generateId(),
                notificationType: 'view',
                message: `Someone viewed your NFT: ${nft.name}`,
                nftId: nft.id,
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (statsError) {
          console.error('Failed to update view stats', statsError);
          // Continue with the request even if stats update fails
        }
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
    if (error || !data) return res.status(400).json({ error: error || 'Invalid bid data' });

    try {
      const bid = await storage.createBid(data);

      // Get NFT details for notification
      const nft = await storage.getNFT(data.nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Get bidder details
      const bidder = await storage.getUser(data.bidderId);
      const bidderName = bidder ? bidder.username : `User #${data.bidderId}`;

      // Notify NFT owner about new bid
      sendNotification(nft.ownerId, {
        id: generateId(),
        notificationType: 'bid',
        message: `New bid of ${data.amount} ${data.currency || 'VET'} on your NFT "${nft.name}" from ${bidderName}!`,
        timestamp: new Date().toISOString(),
        link: `/nft/${nft.id}`,
        thumbnail: nft.imageUrl
      });

      // Notify NFT creator if different from owner
      if (nft.creatorId !== nft.ownerId) {
        sendNotification(nft.creatorId, {
          id: generateId(),
          notificationType: 'bid',
          message: `New bid of ${data.amount} ${data.currency || 'VET'} on your created NFT "${nft.name}"!`,
          timestamp: new Date().toISOString(),
          link: `/nft/${nft.id}`,
          thumbnail: nft.imageUrl
        });
      }

      // Notify other bidders about higher bid
      const otherBids = await storage.getBidsByNFT(nft.id);
      const highestBid = Math.max(...otherBids.map(b => parseFloat(b.amount)));
      const bidAmount = parseFloat(data.amount);

      if (bidAmount > highestBid) {
        // Get unique bidders except current one without using Set spread
        const seenBidderIds = new Map<number, boolean>();
        const uniqueBidders: number[] = [];

        otherBids
          .filter(b => b.bidderId !== data.bidderId)
          .forEach(b => {
            if (!seenBidderIds.has(b.bidderId)) {
              seenBidderIds.set(b.bidderId, true);
              uniqueBidders.push(b.bidderId);
            }
          });

        // Notify them about being outbid
        uniqueBidders.forEach(bidderId => {
          sendNotification(bidderId, {
            id: generateId(),
            notificationType: 'bid',
            message: `Your bid on "${nft.name}" has been outbid! New highest bid: ${data.amount} ${data.currency || 'VET'}`,
            timestamp: new Date().toISOString(),
            link: `/nft/${nft.id}`,
            thumbnail: nft.imageUrl
          });
        });
      }

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
    if (error || !data) return res.status(400).json({ error: error || 'Invalid transaction data' });

    try {
      const transaction = await storage.createTransaction(data);

      // Get NFT details for notification
      const nft = await storage.getNFT(data.nftId);
      if (!nft) {
        throw new Error('NFT not found');
      }

      // Get buyer and seller details
      const buyer = await storage.getUser(data.buyerId);
      const seller = await storage.getUser(data.sellerId);

      const buyerName = buyer ? buyer.username : `User #${data.buyerId}`;
      const sellerName = seller ? seller.username : `User #${data.sellerId}`;

      // Notify seller about sale
      sendNotification(data.sellerId, {
        id: generateId(),
        notificationType: 'sale',
        message: `Your NFT "${nft.name}" has been sold for ${data.price} ${data.currency || 'VET'} to ${buyerName}!`,
        timestamp: new Date().toISOString(),
        link: `/nft/${nft.id}`,
        thumbnail: nft.imageUrl
      });

      // Notify buyer about purchase
      sendNotification(data.buyerId, {
        id: generateId(),
        notificationType: 'sale',
        message: `You successfully purchased "${nft.name}" for ${data.price} ${data.currency || 'VET'} from ${sellerName}!`,
        timestamp: new Date().toISOString(),
        link: `/nft/${nft.id}`,
        thumbnail: nft.imageUrl
      });

      // Notify creator if different from seller
      if (nft.creatorId !== data.sellerId) {
        // Calculate royalty (typically 5-10%)
        const royaltyPercentage = 0.1; // 10%
        const priceValue = parseFloat(data.price);
        const royaltyAmount = (priceValue * royaltyPercentage).toFixed(2);

        sendNotification(nft.creatorId, {
          id: generateId(),
          notificationType: 'sale',
          message: `Your created NFT "${nft.name}" was sold for ${data.price} ${data.currency || 'VET'}! You earned ${royaltyAmount} ${data.currency || 'VET'} in royalties.`,
          timestamp: new Date().toISOString(),
          link: `/nft/${nft.id}`,
          thumbnail: nft.imageUrl
        });
      }

      // Send global notification about high-value sales (optional, for marketplace activity)
      const isHighValue = parseFloat(data.price) >= 1000; // Example threshold
      if (isHighValue) {
        sendNotification(null, {
          id: generateId(),
          notificationType: 'sale',
          message: `NFT "${nft.name}" just sold for ${data.price} ${data.currency || 'VET'}! 🔥`,
          timestamp: new Date().toISOString(),
          link: `/nft/${nft.id}`,
          thumbnail: nft.imageUrl
        });
      }

      // Update NFT ownership
      await storage.updateNFT(nft.id, { 
        ownerId: data.buyerId,
        lastSoldPrice: data.price,
        lastSoldAt: new Date()
      });

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

  // Custom notification endpoint for handling transaction events from client
  app.post('/api/notifications', async (req: Request, res: Response) => {
    try {
      const { userId, type, status, txId, metadata, timestamp, message: customMessage, notificationType: customType } = req.body;

      // Check if this is a direct notification (not a transaction)
      if (userId && customMessage && (type === 'like' || type === 'follow' || type === 'view')) {
        // For direct notifications, use the provided message and type
        const notification = {
          id: generateId(),
          notificationType: type,
          message: customMessage,
          timestamp: timestamp || new Date().toISOString(),
          metadata
        };

        // Log notification for debugging
        console.log(`Sending direct notification to user #${userId}:`, notification.message);

        // Send notification through WebSocket
        sendNotification(userId, notification);

        // Respond to client
        return res.status(200).json({ 
          success: true,
          notification
        });
      }

      // For transaction notifications, require these fields
      if (!userId || !type || !status) {
        return res.status(400).json({ error: 'Missing required notification fields' });
      }

      // Validate user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate notification message based on transaction type and status
      let message = '';
      let notificationType = 'transaction';

      // Process different transaction types and statuses
      if (status === 'initiated') {
        message = `Your ${type} transaction has been initiated and is awaiting confirmation.`;
      } else if (status === 'completed') {
        switch(type) {
          case 'mint':
            message = `Successfully minted your new NFT${metadata?.nftName ? ` "${metadata.nftName}"` : ''}!`;
            notificationType = 'mint';
            break;
          case 'buy':
            message = `Successfully purchased NFT${metadata?.nftName ? ` "${metadata.nftName}"` : ''} for ${metadata?.price || ''} ${metadata?.currency || 'VET'}!`;
            notificationType = 'sale';
            break;
          case 'sell':
            message = `Successfully listed NFT${metadata?.nftName ? ` "${metadata.nftName}"` : ''} for ${metadata?.price || ''} ${metadata?.currency || 'VET'}!`;
            notificationType = 'listing';
            break;
          case 'bid':
            message = `Your bid of ${metadata?.price || ''} ${metadata?.currency || 'VET'} was successfully placed!`;
            notificationType = 'bid';
            break;
          case 'transfer':
            message = `Successfully transferred NFT${metadata?.nftName ? ` "${metadata.nftName}"` : ''} to ${metadata?.recipient || 'recipient'}!`;
            notificationType = 'transfer';
            break;
          default:
            message = `Your ${type} transaction was completed successfully!`;
        }
      } else if (status === 'failed') {
        message = `Your ${type} transaction has failed. Please try again.`;
      }

      // Create notification object
      const notification = {
        id: generateId(),
        notificationType,
        message,
        timestamp: timestamp || new Date().toISOString(),
        txId,
        metadata
      };

      // Log notification for debugging
      console.log(`Sending notification to user #${userId}:`, notification.message);

      // Send notification through WebSocket
      sendNotification(userId, notification);

      // Respond to client
      res.status(200).json({ 
        success: true,
        notification
      });
    } catch (err: any) {
      console.error('Notification error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // VeChain Network Proxy Endpoints
  // These endpoints solve CORS issues by proxying requests to VeChain nodes

  // Define VeChain node URLs - using veblocks.net for better compatibility
  const VECHAIN_NODES = {
    mainnet: 'https://mainnet.veblocks.net',
    testnet: 'https://testnet.veblocks.net'
  };

  // Enhanced proxy middleware for VeChain API requests with better CORS handling
  const veChainProxy = async (req: Request, res: Response, network: 'mainnet' | 'testnet') => {
    try {
      const baseUrl = VECHAIN_NODES[network];
      const path = req.path.replace(`/api/vechain/${network}`, '');
      const url = `${baseUrl}${path}`;

      console.log(`[VeChain Proxy] Forwarding request to: ${url}`);

      // Set CORS headers to ensure browsers accept our response
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(req.query)) {
        if (value !== undefined) {
          params.append(key, value as string);
        }
      }

      const queryString = params.toString();
      const fullUrl = queryString ? `${url}?${queryString}` : url;

      // Copy headers from the original request
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // Copy important headers from the client request
      const headersToForward = ['authorization', 'x-api-key'];
      for (const header of headersToForward) {
        const value = req.headers[header];
        if (value) {
          headers[header] = value as string;
        }
      }

      const options: any = {
        method: req.method,
        headers: headers,
      };

      // Forward request body for non-GET requests
      if (req.method !== 'GET' && req.body) {
        options.body = JSON.stringify(req.body);
      }

      console.log(`[VeChain Proxy] Request options:`, {
        url: fullUrl,
        method: options.method,
        headersLength: Object.keys(options.headers).length,
        hasBody: !!options.body
      });

      const response = await fetch(fullUrl, options);

      // Handle various response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses, use text
        data = { text: await response.text() };
      }

      // Forward important response headers
      // Use Array.from to convert iterator to array to work with TypeScript
      const headerEntries = Array.from(response.headers.entries());
      for (const entry of headerEntries) {
        const [key, value] = entry;
        // Skip headers that might cause CORS issues
        if (!['content-length', 'connection'].includes(key.toLowerCase())) {
          res.header(key, value);
        }
      }

      res.status(response.status).json(data);
    } catch (error: any) {
      console.error('[VeChain Proxy] Error:', error);
      res.status(500).json({ 
        error: 'Failed to proxy request to VeChain node',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  // Proxy routes for VeChain TestNet with CORS support
  app.options('/api/vechain/testnet/*', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.status(200).end();
  });

  app.get('/api/vechain/testnet/*', (req: Request, res: Response) => {
    veChainProxy(req, res, 'testnet');
  });

  app.post('/api/vechain/testnet/*', (req: Request, res: Response) => {
    veChainProxy(req, res, 'testnet');
  });

  // Proxy routes for VeChain MainNet with CORS support
  app.options('/api/vechain/mainnet/*', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.status(200).end();
  });

  app.get('/api/vechain/mainnet/*', (req: Request, res: Response) => {
    veChainProxy(req, res, 'mainnet');
  });

  app.post('/api/vechain/mainnet/*', (req: Request, res: Response) => {
    veChainProxy(req, res, 'mainnet');
  });

  // Specific endpoints for commonly used VeChain API endpoints
  app.get('/api/vechain/best-block', async (req: Request, res: Response) => {
    try {
      const network = req.query.network === 'main' ? 'mainnet' : 'testnet';
      const response = await fetch(`${VECHAIN_NODES[network]}/blocks/best`);
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error('[VeChain API] Error fetching best block:', error);
      res.status(500).json({ 
        error: 'Failed to fetch best block',
        message: error.message
      });
    }
  });

  app.get('/api/vechain/genesis-id', async (req: Request, res: Response) => {
    try {
      const network = req.query.network === 'main' ? 'mainnet' : 'testnet';

      // Use hardcoded genesis IDs for reliable response - these are the official IDs
      const GENESIS_IDS = {
        mainnet: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
        testnet: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
      };

      // Return the correct genesis ID for the requested network
      res.json({
        genesisId: GENESIS_IDS[network],
        network: network
      });
    } catch (error: any) {
      console.error('[VeChain API] Error fetching genesis ID:', error);
      res.status(500).json({ 
        error: 'Failed to fetch genesis ID',
        message: error.message
      });
    }
  });

  //Game Routes
  app.use('/games', express.static(path.join(__dirname, '../public/games')));
  app.use('/images', express.static(path.join(__dirname, '../public/images')));

  return httpServer;
}