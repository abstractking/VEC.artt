/**
 * Vercel-specific Vite Configuration
 * Extends the unified base configuration with Vercel-specific overrides
 */

import { defineConfig } from 'vite';
import { baseConfig } from './vite.config.unified';
import path from 'path';

// Inject polyfills into HTML for Vercel deployment (as inline script to avoid MIME type issues)
const injectPolyfillsToHTML = () => {
  const fs = require('fs');
  const path = require('path');
  
  return {
    name: 'inject-polyfills-html',
    transformIndexHtml(html) {
      // Read the polyfills script
      let polyfillsContent;
      try {
        // Read the script file directly, this avoids MIME type issues
        polyfillsContent = fs.readFileSync(
          path.resolve(__dirname, 'client/src/vercel-polyfills.js'),
          'utf-8'
        );
      } catch (error) {
        console.error('Failed to read vercel-polyfills.js:', error);
        // Fallback to empty content if file not found
        polyfillsContent = '';
      }
      
      // Inject as inline script to avoid MIME type issues with Vercel
      return html.replace(
        '<head>',
        `<head>
    <script type="text/javascript">
    ${polyfillsContent}
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