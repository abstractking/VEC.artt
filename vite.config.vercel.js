/**
 * Vercel-specific Vite Configuration
 * Extends the unified base configuration with Vercel-specific overrides
 */

import { defineConfig } from 'vite';
import { baseConfig } from './vite.config.unified';
import path from 'path';
import fs from 'fs';

// Hardcoded polyfill script for Vercel deployment
// This avoids the dynamic fs.readFileSync which doesn't work in ESM context
const POLYFILL_SCRIPT = `
/**
 * Browser polyfills for VeChain compatibility on Vercel
 * This file is embedded directly in the HTML to avoid MIME type issues
 */

// Skip initialization if it's already been done
if (typeof window !== 'undefined' && window.__POLYFILLS_INITIALIZED__) {
  console.log('Polyfills already initialized, skipping duplicate initialization');
} else if (typeof window !== 'undefined') {
  // Ensure global is defined
  if (!window.global) {
    window.global = window;
  }

  // Ensure process is defined with environment variables
  // Create or update process.env with environment variables
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  
  // Explicitly define critical environment variables for VeChain
  const envVars = {
    NODE_ENV: 'production',
    VITE_VECHAIN_NETWORK: 'test',
    VITE_VECHAIN_NODE_URL_TESTNET: 'https://testnet.veblocks.net',
    VITE_VECHAIN_NODE_URL_MAINNET: 'https://mainnet.veblocks.net',
    VITE_VECHAIN_TESTNET_GENESIS_ID: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    VITE_VECHAIN_MAINNET_GENESIS_ID: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
    VITE_DEPLOYMENT_ENV: 'vercel'
  };
  
  // Merge with existing values, preferring existing values if present
  Object.keys(envVars).forEach(key => {
    if (!(key in window.process.env) || !window.process.env[key]) {
      window.process.env[key] = envVars[key];
    }
  });
  
  // Add process properties
  window.process.browser = true;
  window.process.nextTick = window.process.nextTick || ((cb) => setTimeout(cb, 0));

  // Mark as initialized to prevent duplicate initialization
  window.__POLYFILLS_INITIALIZED__ = true;
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

console.log('Critical polyfills initialized via Vercel inline script');
`;

// Inject polyfills into HTML for Vercel deployment (as inline script to avoid MIME type issues)
const injectPolyfillsToHTML = () => {
  return {
    name: 'inject-polyfills-html',
    transformIndexHtml(html) {
      // Inject as inline script to avoid MIME type issues with Vercel
      return html.replace(
        '<head>',
        `<head>
    <script type="text/javascript">
    ${POLYFILL_SCRIPT}
    </script>`
      );
    },
  };
};

// Merge the base configuration with Vercel-specific overrides
export default defineConfig({
  ...baseConfig,
  root: path.resolve(__dirname, 'client'),
  plugins: [
    ...baseConfig.plugins,
    injectPolyfillsToHTML(),
  ],
  define: {
    'global': 'globalThis',
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      VITE_VECHAIN_NETWORK: process.env.VITE_VECHAIN_NETWORK || 'test',
      VITE_VECHAIN_NODE_URL_TESTNET: process.env.VITE_VECHAIN_NODE_URL_TESTNET || 'https://testnet.veblocks.net',
      VITE_VECHAIN_NODE_URL_MAINNET: process.env.VITE_VECHAIN_NODE_URL_MAINNET || 'https://mainnet.veblocks.net',
      VITE_VECHAIN_TESTNET_GENESIS_ID: process.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
      VITE_VECHAIN_MAINNET_GENESIS_ID: process.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
      VITE_DEPLOYMENT_ENV: process.env.VITE_DEPLOYMENT_ENV || 'vercel',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      'https': path.resolve(__dirname, './client/src/shims/https-shim.js'),
      'http': path.resolve(__dirname, './client/src/shims/http-shim.js'),
      'stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
      'util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
      'crypto': path.resolve(__dirname, './client/src/shims/crypto-shim.js'),
      'vm': path.resolve(__dirname, './client/src/shims/vm-shim.js'),
      'stream/web': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
      'node:stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
      'node:util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
      'node:crypto': path.resolve(__dirname, './client/src/shims/crypto-shim.js'),
      'node:vm': path.resolve(__dirname, './client/src/shims/vm-shim.js'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['@walletconnect/ethereum-client'],
      plugins: [
        {
          name: 'override-node-modules',
          resolveId(source, importer) {
            const aliases = {
              'https': path.resolve(__dirname, './client/src/shims/https-shim.js'),
              'http': path.resolve(__dirname, './client/src/shims/http-shim.js'),
              'stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
              'util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
              'crypto': path.resolve(__dirname, './client/src/shims/crypto-shim.js'),
              'vm': path.resolve(__dirname, './client/src/shims/vm-shim.js'),
              'node:stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
              'node:util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
              'node:crypto': path.resolve(__dirname, './client/src/shims/crypto-shim.js'),
              'node:vm': path.resolve(__dirname, './client/src/shims/vm-shim.js'),
              'stream/web': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
            };
            return aliases[source] || null;
          }
        }
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});