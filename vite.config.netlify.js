// Enhanced Vite configuration specifically for Netlify build environment
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Resolve paths relative to project root
const rootDir = process.cwd();
const clientDir = path.resolve(rootDir, 'client');

export default defineConfig({
  // Set the root directory to client where index.html is located
  root: clientDir,
  
  // Configure plugins
  plugins: [
    react(),
    nodePolyfills({
      // Specifically include problematic modules from console warnings
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    // Plugin to transform index.html
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        // Add extra meta tags for Netlify deployment
        return html.replace(
          '<head>',
          `<head>
    <meta name="deployment-platform" content="netlify">
    <meta name="description" content="VeCollab - A blockchain NFT marketplace on VeChain">
`
        );
      }
    }
  ],
  
  // Build configuration
  build: {
    outDir: path.resolve(rootDir, 'dist/public'),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: process.env.NODE_ENV === 'production',
    target: 'es2020',
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
  
  // Dependency optimization - focus on problematic packages
  optimizeDeps: {
    include: [
      'crypto-browserify', 
      'buffer', 
      'stream-browserify', 
      'util', 
      'events', 
      'thor-devkit',
      '@vechain/connex-driver',
      '@vechain/connex-framework'
    ],
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
      'path': 'path-browserify',
      // Add specific aliases for Thor and VeChain packages
      'thor-devkit': path.resolve(rootDir, 'node_modules/thor-devkit/dist/index.js'),
    },
  },
});