import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import fs from 'fs';

// Inject polyfills into HTML for Vercel deployment
const injectPolyfillsToHTML = () => {
  return {
    name: 'inject-polyfills-html',
    transformIndexHtml(html) {
      // Add the polyfill script to the head
      return html.replace(
        '<head>',
        `<head>
    <script type="module" src="/src/vercel-polyfills.js"></script>`
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [
    react(),
    // Add Node.js polyfills with specific options to fix Vercel deployment issues
    nodePolyfills({
      // Whether to polyfill specific Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      // Whether to polyfill Node.js builtins
      protocolImports: true,
    }),
    // Inject polyfills into HTML
    injectPolyfillsToHTML(),
  ],
  define: {
    // Define global variables for browser environment
    'global': 'globalThis',
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      VITE_VECHAIN_NETWORK: process.env.VITE_VECHAIN_NETWORK || 'test',
      VITE_VECHAIN_NODE_URL_TESTNET: process.env.VITE_VECHAIN_NODE_URL_TESTNET || 'https://testnet.veblocks.net',
      VITE_VECHAIN_NODE_URL_MAINNET: process.env.VITE_VECHAIN_NODE_URL_MAINNET || 'https://mainnet.veblocks.net',
      VITE_VECHAIN_TESTNET_GENESIS_ID: process.env.VITE_VECHAIN_TESTNET_GENESIS_ID || '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
      VITE_VECHAIN_MAINNET_GENESIS_ID: process.env.VITE_VECHAIN_MAINNET_GENESIS_ID || '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
      VITE_DEPLOYMENT_ENV: process.env.VITE_DEPLOYMENT_ENV || 'vercel',
    },
  },
  resolve: {
    alias: {
      // Add aliases for common imports
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      // Use shims for problematic Node.js modules
      'https': path.resolve(__dirname, './client/src/shims/https-shim.js'),
      'http': path.resolve(__dirname, './client/src/shims/http-shim.js'),
      'stream': path.resolve(__dirname, './client/src/shims/stream-shim.js'),
      'util': path.resolve(__dirname, './client/src/shims/util-shim.js'),
      'crypto': path.resolve(__dirname, './client/src/shims/crypto-shim.js'),
      'vm': path.resolve(__dirname, './client/src/shims/vm-shim.js'),
      // These are needed because of weird import issues in dependencies
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
      transformMixedEsModules: true, // Handle mixed ES/CommonJS modules
    },
    rollupOptions: {
      // Custom handling for external modules
      external: [],
      // Override module resolution for problematic modules
      plugins: [
        {
          name: 'override-node-modules',
          resolveId(source, importer) {
            // Handle specific Node.js modules that cause issues
            if (source === 'https' || source === 'http' || source === 'stream' || source === 'util' || 
                source === 'crypto' || source === 'vm' ||
                source === 'node:stream' || source === 'node:util' || source === 'node:crypto' || 
                source === 'node:vm' || source === 'stream/web') {
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
            return null;
          }
        }
      ]
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Define global variables during dependency optimization
      define: {
        global: 'globalThis'
      },
    }
  },
  server: {
    // Configure dev server to handle API requests
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});