/**
 * Vercel Post-build Script
 * This script runs after the build process on Vercel to make final adjustments
 */

const fs = require('fs');
const path = require('path');

console.log("Running post-build steps for Vercel deployment...");

// Define paths
const distDir = path.resolve(__dirname, '../dist');
const publicDir = path.resolve(distDir, 'public');
const apiDir = path.resolve(distDir, 'api');

// Ensure directories exist
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Create Vercel API adapter file if it doesn't exist
const apiHandlerPath = path.join(apiDir, 'index.js');
if (!fs.existsSync(apiHandlerPath)) {
  console.log("Creating Vercel API adapter...");
  
  const apiHandlerContent = `
// Vercel API Handler
// This file adapts the Express API to Vercel's serverless functions
import { createServer } from 'http';
import { URL } from 'url';
import app from '../server/index.js';

const server = createServer(app);

export default async (req, res) => {
  // Parse the request URL
  const parsedUrl = new URL(req.url, 'http://localhost');
  
  // Add original URL to the request object (used by Express)
  req.originalUrl = req.url;
  req.path = parsedUrl.pathname;
  req.query = Object.fromEntries(parsedUrl.searchParams);
  
  // Handle the request with the Express app
  return new Promise((resolve) => {
    app(req, res);
    res.on('finish', resolve);
  });
};
`;
  
  fs.writeFileSync(apiHandlerPath, apiHandlerContent);
  console.log("API adapter created successfully.");
}

// Create a _redirects file for Vercel to handle client-side routing
const redirectsPath = path.join(publicDir, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log("Creating _redirects file...");
  
  const redirectsContent = `
# Redirects for client-side routing
/api/*  /api/:splat  200
/*      /index.html  200
`;
  
  fs.writeFileSync(redirectsPath, redirectsContent);
  console.log("_redirects file created successfully.");
}

console.log("Post-build tasks completed successfully.");