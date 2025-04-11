// Enhanced Vite configuration for Netlify builds
// Includes proper directory structure handling

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Resolve paths relative to project root
const rootDir = __dirname;
const clientDir = path.resolve(rootDir, 'client');

export default defineConfig({
  // Set the root directory to client where index.html is located
  root: clientDir,
  
  // Configure plugins
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  
  // Build configuration
  build: {
    outDir: path.resolve(rootDir, 'dist/public'),
    emptyOutDir: true,
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  
  // Global definitions
  define: {
    'process.env': process.env,
    'window.global': 'window',
    'global': 'window',
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: ['crypto-browserify', 'buffer', 'process', 'stream-browserify'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  
  // Module resolution
  resolve: {
    alias: {
      '@': path.resolve(clientDir, 'src'),
      '@shared': path.resolve(rootDir, 'shared'),
      'stream': 'stream-browserify',
      'crypto': 'crypto-browserify',
    },
  },
});