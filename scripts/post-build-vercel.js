/**
 * Post-build script for Vercel deployment
 * This script runs after the build phase to handle any final tasks:
 * 1. Create necessary server-side files
 * 2. Move API routes to the correct location
 * 3. Create a static fallback page
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Running VeCollab post-build script for Vercel...');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(DIST_DIR, 'public');
const API_DIR = path.join(DIST_DIR, 'api');

// Create API directory if it doesn't exist
if (!fs.existsSync(API_DIR)) {
  console.log('Creating API directory...');
  fs.mkdirSync(API_DIR, { recursive: true });
}

// Create an index.js file in the API directory for Vercel serverless functions
const apiIndexFile = path.join(API_DIR, 'index.js');
if (!fs.existsSync(apiIndexFile)) {
  console.log('Creating API routes file...');
  fs.writeFileSync(apiIndexFile, `// Vercel Serverless API Handler
const express = require('express');
const { createServer } = require('http');
const { MemStorage } = require('../server/storage');
const { setupRoutes } = require('../server/routes');
const { DrizzleStorage } = require('../server/storage');

// Setup Express
const app = express();
app.use(express.json());

// Setup storage (use DB in production)
const useDatabase = process.env.DATABASE_URL !== undefined;
const storage = useDatabase ? new DrizzleStorage() : new MemStorage();

// Setup routes
setupRoutes(app, storage);

// Vercel serverless function handler
module.exports = async (req, res) => {
  // Pass request to express app
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.on('error', reject);
    
    const originalEnd = res.end;
    res.end = function() {
      originalEnd.apply(this, arguments);
      resolve();
    };
    
    app(req, res);
  });
};`);
}

// Create a static fallback page
const fallbackHtml = path.join(PUBLIC_DIR, '200.html');
if (!fs.existsSync(fallbackHtml)) {
  console.log('Creating static fallback page...');
  fs.writeFileSync(fallbackHtml, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VeCollab NFT Marketplace</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      color: #333;
    }
    header {
      background-color: #294b7a;
      color: white;
      padding: 1rem;
      text-align: center;
    }
    main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    .logo {
      width: 120px;
      height: 120px;
      background-color: #294b7a;
      border-radius: 50%;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: bold;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .spinner {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #294b7a;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .retry-button {
      background-color: #294b7a;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .retry-button:hover {
      background-color: #1d3557;
    }
    footer {
      text-align: center;
      padding: 1rem;
      background-color: #f1f1f1;
      margin-top: auto;
    }
  </style>
  <script>
    // Redirect to main app after brief delay
    setTimeout(function() {
      window.location.href = '/';
    }, 2000);
  </script>
</head>
<body>
  <header>
    <h1>VeCollab NFT Marketplace</h1>
  </header>
  <main>
    <div class="logo">VC</div>
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading the application...</p>
    </div>
    <p>Discover and trade unique digital assets on the VeChain blockchain.</p>
    <button class="retry-button" onclick="window.location.reload()">Retry Loading</button>
  </main>
  <footer>
    <p>&copy; 2023-2025 VeCollab NFT Marketplace. All rights reserved.</p>
  </footer>
</body>
</html>`);
}

console.log('✅ VeCollab post-build preparation complete!');