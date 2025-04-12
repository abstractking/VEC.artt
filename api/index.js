/**
 * Vercel API Adapter
 * This file adapts the Express app to Vercel's serverless function format
 */

import { createServer } from 'http';
import { URL } from 'url';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

// Create a new Express app instance
const app = express();

// Set up body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Register routes with our server instance
registerRoutes(app);

// Handler for Vercel's serverless function
export default async (req, res) => {
  // Add timestamp to the beginning of request processing for logging
  const startTime = Date.now();
  
  // Parse the request URL
  const parsedUrl = new URL(req.url, `https://${req.headers.host}`);
  
  // Add properties expected by Express to the request object
  req.originalUrl = req.url;
  req.path = parsedUrl.pathname;
  req.query = Object.fromEntries(parsedUrl.searchParams);
  
  // Set CORS headers for API routes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Process the request with the Express app
  return new Promise((resolve) => {
    app(req, res);
    res.on('finish', () => {
      // Log request details after completion
      const duration = Date.now() - startTime;
      console.log(`[vercel] ${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      resolve();
    });
  });
};