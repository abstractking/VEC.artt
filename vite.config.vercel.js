import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

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
  ],
  define: {
    // Define global variables for browser environment
    'global': 'globalThis',
    'process.env': process.env,
  },
  resolve: {
    alias: {
      // Add aliases for common imports
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    }
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true, // Handle mixed ES/CommonJS modules
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