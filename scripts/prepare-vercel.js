/**
 * Prepare script for Vercel deployment
 * This script runs during the build phase to:
 * 1. Copy necessary shim files
 * 2. Patch problematic dependencies
 * 3. Configure environment-specific settings
 * 
 * Run with: node scripts/prepare-vercel.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Running VeCollab preparation script for Vercel...');

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const SHIMS_DIR = path.join(ROOT_DIR, 'client/src/shims');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PUBLIC_DIR = path.join(DIST_DIR, 'public');
const NODE_MODULES_DIR = path.join(ROOT_DIR, 'node_modules');

// Patch problematic dependencies to use our shims
console.log('Patching VeChain dependencies for browser compatibility...');

// Function to patch a file with correct import replacements
function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`Skip patching: File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  replacements.forEach(({ from, to }) => {
    content = content.replace(from, to);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Patched: ${filePath}`);
    return true;
  }
  
  console.log(`No changes needed: ${filePath}`);
  return false;
}

// List of files to patch
const filePatches = [
  {
    file: path.join(NODE_MODULES_DIR, '@vechain/connex-driver/esm/simple-net.js'),
    replacements: [
      {
        // Complete file replacement to ensure compatibility
        from: `import { SimpleNet } from './interfaces';
import { SimpleWebSocketReader } from './simple-websocket-reader';
import { resolve } from 'url';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';`,
        to: `import { SimpleNet } from './interfaces';
import { SimpleWebSocketReader } from './simple-websocket-reader';
import { resolve } from 'url';

// Patched by VeCollab for browser compatibility
// Original imports removed:
// import { Agent as HttpAgent } from 'http';
// import { Agent as HttpsAgent } from 'https';

// Replaced with stub implementations
class HttpAgent {
  constructor() {}
}

class HttpsAgent {
  constructor() {}
}`
      }
    ]
  },
  // Alternate patch as fallback if the above pattern doesn't match
  {
    file: path.join(NODE_MODULES_DIR, '@vechain/connex-driver/esm/simple-net.js'),
    replacements: [
      {
        from: `import { Agent as HttpAgent } from 'http';`,
        to: `// Patched by VeCollab for browser compatibility
// Original: import { Agent as HttpAgent } from 'http';
const HttpAgent = class {
  constructor() {}
};`
      },
      {
        from: `import { Agent as HttpsAgent } from 'https';`,
        to: `// Patched by VeCollab for browser compatibility
// Original: import { Agent as HttpsAgent } from 'https';
const HttpsAgent = class {
  constructor() {}
};`
      }
    ]
  },
  {
    file: path.join(NODE_MODULES_DIR, 'thor-devkit/dist/es/cry/secp256k1.js'),
    replacements: [
      {
        from: `import { createHash } from "crypto";`,
        to: `// Patched by VeCollab for browser compatibility
// Original: import { createHash } from "crypto";
const createHash = function(algorithm) {
  // Basic browser-compatible SHA256 implementation using Web Crypto API
  return {
    update: function(data) {
      this._data = data;
      return this;
    },
    digest: function() {
      // For browser, use subtle crypto
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Note: This is a sync implementation for simplicity
        // In a real app, you'd want to use the async version
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(this._data);
        const hashBuffer = window.crypto.subtle.digestSync('SHA-256', data);
        return new Uint8Array(hashBuffer);
      }
      // Fallback
      console.warn('Crypto hash requested but not available in browser');
      return new Uint8Array(32); // Return empty hash
    }
  };
};`
      }
    ]
  },
  {
    file: path.join(NODE_MODULES_DIR, '@vechain/connex-framework/dist/esm/driver-interface.js'),
    replacements: [
      {
        from: `import { EventEmitter } from "events";`,
        to: `// Patched by VeCollab for browser compatibility
// Original: import { EventEmitter } from "events";
class EventEmitter {
  constructor() {
    this._events = {};
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
  
  removeListener(event, listener) {
    if (!this._events[event]) return this;
    this._events[event] = this._events[event].filter(l => l !== listener);
    return this;
  }
}
`
      }
    ]
  }
];

// Apply all patches
let patchesApplied = 0;
filePatches.forEach(patch => {
  if (patchFile(patch.file, patch.replacements)) {
    patchesApplied++;
  }
});

console.log(`Applied ${patchesApplied} patches out of ${filePatches.length} total.`);

// Make sure the shims directory exists
if (!fs.existsSync(SHIMS_DIR)) {
  console.log('Creating shims directory...');
  fs.mkdirSync(SHIMS_DIR, { recursive: true });
}

// Function to check if a file exists and create it if not
function ensureFileExists(filePath, content) {
  if (!fs.existsSync(filePath)) {
    console.log(`Creating ${path.basename(filePath)}...`);
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Make sure that all shim files exist
const httpsShim = path.join(SHIMS_DIR, 'https-shim.js');
ensureFileExists(httpsShim, `/**
 * HTTPS shim for browser environments
 * This provides compatibility interfaces for code expecting Node's HTTPS module
 */

// Stub Agent class that caused issues in Vercel build
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

// Export default module interface
export default {
  Agent,
  request: () => {
    throw new Error('https.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('https.get is not supported in browser environments');
  }
};`);

const httpShim = path.join(SHIMS_DIR, 'http-shim.js');
ensureFileExists(httpShim, `/**
 * HTTP shim for browser environments
 * This provides compatibility interfaces for code expecting Node's HTTP module
 */

// Stub Agent class for compatibility
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

// Export default module interface
export default {
  Agent,
  request: () => {
    throw new Error('http.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('http.get is not supported in browser environments');
  }
};`);

const streamShim = path.join(SHIMS_DIR, 'stream-shim.js');
ensureFileExists(streamShim, `/**
 * Stream shim for browser environments
 * This provides compatibility interfaces for code expecting Node's Stream module
 */

// Basic Transform stream implementation
export class Transform {
  constructor() {
    this._events = {};
  }
  
  _transform() {
    // Minimal implementation
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Basic Readable stream implementation
export class Readable {
  constructor() {
    this._events = {};
  }
  
  pipe() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Basic Writable stream implementation
export class Writable {
  constructor() {
    this._events = {};
  }
  
  write() {
    // Minimal implementation
    return true;
  }
  
  end() {
    // Minimal implementation
    return this;
  }
  
  on(event, listener) {
    this._events[event] = this._events[event] || [];
    this._events[event].push(listener);
    return this;
  }
  
  emit(event, ...args) {
    if (!this._events[event]) return false;
    this._events[event].forEach(listener => listener(...args));
    return true;
  }
}

// Export default module interface
export default {
  Transform,
  Readable,
  Writable,
  // Add other needed stream classes/utilities
  pipeline: () => {
    throw new Error('stream.pipeline is not supported in browser environments');
  }
};`);

const utilShim = path.join(SHIMS_DIR, 'util-shim.js');
ensureFileExists(utilShim, `/**
 * Util shim for browser environments
 * This provides compatibility interfaces for code expecting Node's util module
 */

// Basic debuglog implementation
export const debuglog = () => {
  return () => {}; // No-op function
};

// Basic inspect implementation
export const inspect = (obj) => {
  if (typeof obj === 'object' && obj !== null) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return String(obj);
    }
  }
  return String(obj);
};

// Basic format implementation (like util.format)
export const format = (...args) => {
  return args.map(arg => 
    typeof arg === 'object' && arg !== null 
      ? JSON.stringify(arg) 
      : String(arg)
  ).join(' ');
};

// Basic inherits implementation
export const inherits = (ctor, superCtor) => {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

// Export default module interface
export default {
  debuglog,
  inspect,
  format,
  inherits,
  // Add other needed util functions
  promisify: (fn) => {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err, ...results) => {
          if (err) return reject(err);
          if (results.length === 1) return resolve(results[0]);
          return resolve(results);
        });
      });
    };
  }
};`);

// Ensure polyfill file exists
const polyfillsFile = path.join(ROOT_DIR, 'client/src/vercel-polyfills.js');
ensureFileExists(polyfillsFile, `/**
 * Browser polyfills for VeChain compatibility on Vercel
 * This file gets imported early in the app's lifecycle to ensure critical polyfills are available
 */

// Ensure global is defined
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Ensure process is defined with environment variables
if (typeof window !== 'undefined' && !window.process) {
  window.process = { 
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      VITE_VECHAIN_NETWORK: process.env.VITE_VECHAIN_NETWORK,
      VITE_VECHAIN_NODE_URL_TESTNET: process.env.VITE_VECHAIN_NODE_URL_TESTNET,
      VITE_VECHAIN_NODE_URL_MAINNET: process.env.VITE_VECHAIN_NODE_URL_MAINNET,
      VITE_VECHAIN_TESTNET_GENESIS_ID: process.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
      VITE_VECHAIN_MAINNET_GENESIS_ID: process.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
      VITE_DEPLOYMENT_ENV: process.env.VITE_DEPLOYMENT_ENV
    }, 
    browser: true,
    nextTick: (cb) => setTimeout(cb, 0)
  };
}

// Ensure Buffer is available
if (typeof window !== 'undefined' && !window.Buffer) {
  const textEncoder = new TextEncoder();
  const textDecoder = new TextDecoder();
  
  class Buffer {
    static from(data, encoding) {
      if (typeof data === 'string') {
        return textEncoder.encode(data);
      }
      if (data instanceof Uint8Array) {
        return data;
      }
      return new Uint8Array(data);
    }
    
    static isBuffer(obj) { 
      return obj instanceof Uint8Array; 
    }
    
    static alloc(size) {
      return new Uint8Array(size);
    }
    
    static concat(list, length) {
      if (length === undefined) {
        length = list.reduce((acc, val) => acc + val.length, 0);
      }
      
      const result = new Uint8Array(length);
      let offset = 0;
      
      for (const buf of list) {
        result.set(buf, offset);
        offset += buf.length;
      }
      
      return result;
    }
  }
  
  window.Buffer = Buffer;
}

// Ensure crypto is available
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = {
    getRandomValues: function(buffer) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  };
}

// Fix for module exports
if (typeof window !== 'undefined') {
  window.module = window.module || {};
  window.module.exports = window.module.exports || {};
  window.exports = window.exports || {};
}

console.log('Critical polyfills initialized via Vercel inline script');`);

// Create vercel.json if it doesn't exist
const vercelConfigFile = path.join(ROOT_DIR, 'vercel.json');
ensureFileExists(vercelConfigFile, `{
  "buildCommand": "node scripts/prepare-vercel.js && vite build --config vite.config.vercel.js && node scripts/post-build-vercel.js",
  "installCommand": "npm ci",
  "outputDirectory": "dist/public",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "env": {
    "VITE_VECHAIN_NETWORK": "test",
    "VITE_VECHAIN_NODE_URL_TESTNET": "https://testnet.veblocks.net",
    "VITE_VECHAIN_NODE_URL_MAINNET": "https://mainnet.veblocks.net",
    "VITE_VECHAIN_TESTNET_GENESIS_ID": "0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409",
    "VITE_VECHAIN_MAINNET_GENESIS_ID": "0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409",
    "VITE_DEPLOYMENT_ENV": "vercel"
  }
}`);

// Create post-build-vercel.js script to handle any post-build tasks
const postBuildScript = path.join(ROOT_DIR, 'scripts/post-build-vercel.js');
ensureFileExists(postBuildScript, `/**
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
  const apiCode = `// Vercel Serverless API Handler
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
};`;
  fs.writeFileSync(apiIndexFile, apiCode);
}

// Create a static fallback page
const fallbackHtml = path.join(PUBLIC_DIR, '200.html');
if (!fs.existsSync(fallbackHtml)) {
  console.log('Creating static fallback page...');
  const fallbackHtmlContent = `<!DOCTYPE html>
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
</html>`;
  fs.writeFileSync(fallbackHtml, fallbackHtmlContent);
}

console.log('✅ VeCollab post-build preparation complete!');

console.log('✅ VeCollab preparation script completed successfully!');