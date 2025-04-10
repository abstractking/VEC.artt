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
      return html.replace(
        '<head>',
        `<head>
    <script type="module" src="/src/vercel-polyfills.js"></script>`
      );
    },
  };
};

export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
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