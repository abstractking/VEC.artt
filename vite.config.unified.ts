/**
 * Unified Vite Configuration Base
 * This serves as the base configuration that all platform-specific configs extend from.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';
import fs from 'fs';

// Import Replit plugins conditionally to prevent errors on other platforms
const replitPlugins: any[] = [];
try {
  // Using dynamic imports to avoid TypeScript errors
  const cartographer = require('@replit/vite-plugin-cartographer')?.cartographer;
  const runtimeErrorModal = require('@replit/vite-plugin-runtime-error-modal')?.runtimeErrorModal;
  const shadcnThemeJson = require('@replit/vite-plugin-shadcn-theme-json')?.shadcnThemeJson;
  
  if (cartographer) replitPlugins.push(cartographer());
  if (runtimeErrorModal) replitPlugins.push(runtimeErrorModal());
  if (shadcnThemeJson) replitPlugins.push(shadcnThemeJson());
} catch (e) {
  console.log('Replit plugins not available, skipping...');
}

// Base configuration that's common to all environments
export const baseConfig = {
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
    ...replitPlugins,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@shared': path.resolve(__dirname, './shared'),
      '@server': path.resolve(__dirname, './server'),
      '@assets': path.resolve(__dirname, './client/src/assets'),
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      assert: 'assert',
      http: 'stream-http',
      https: 'https-browserify',
      os: 'os-browserify/browser',
      url: 'url',
      zlib: 'browserify-zlib',
      path: 'path-browserify',
    },
  },
  build: {
    outDir: 'dist/public',
    emptyOutDir: true,
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    include: [
      'thor-devkit',
      'buffer',
      'process',
      'events',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
};

// Default export is the base configuration without environment-specific customizations
export default defineConfig(baseConfig);