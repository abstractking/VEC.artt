#!/usr/bin/env node

/**
 * Netlify build script
 * This script handles the build process for Netlify deployment
 * ensuring that vite and other tools are properly installed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Starting Netlify build process...');

try {
  // Make sure we have all the necessary dependencies
  console.log('🔍 Ensuring build dependencies are installed...');
  execSync('npm install -g vite esbuild', { stdio: 'inherit' });
  
  // Install development dependencies needed for the build
  console.log('🔍 Installing required dev dependencies...');
  execSync('npm install --no-save @vitejs/plugin-react @replit/vite-plugin-cartographer @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-shadcn-theme-json vite-plugin-node-polyfills typescript @types/node @types/react @types/react-dom', { stdio: 'inherit' });
  
  // Clean cache
  console.log('🧹 Cleaning build cache...');
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
  }
  
  // Run patch scripts
  console.log('🔧 Patching thor-devkit...');
  require('./patch-thor-devkit.cjs');
  
  console.log('🔧 Patching VeWorld vendor...');
  require('./veworld-vendor-patch.cjs');
  
  // Run the build with detailed output
  console.log('🏗️ Building the application...');
  
  // Create a temporary vite config for the build
  console.log('📝 Preparing build configuration...');
  const tempConfig = `
    // Generated temporary vite config for Netlify build
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nodePolyfills } from 'vite-plugin-node-polyfills';
    
    export default defineConfig({
      plugins: [
        react(),
        nodePolyfills({
          include: ['buffer', 'crypto', 'stream', 'util'],
          globals: {
            Buffer: true,
            global: true,
            process: true,
          },
        }),
      ],
      define: {
        'process.env': process.env,
        'window.global': 'window',
      },
      build: {
        outDir: 'dist/public',
        emptyOutDir: true,
        sourcemap: true,
        commonjsOptions: {
          transformMixedEsModules: true,
        },
      },
      resolve: {
        alias: {
          '@': '/client/src',
          '@shared': '/shared',
        },
      },
    });
  `;
  
  fs.writeFileSync('vite.config.netlify.js', tempConfig, 'utf8');
  
  // Run the build with the temporary config
  try {
    execSync('npx vite build --config vite.config.netlify.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('Build failed, trying alternative configuration...');
    
    // Try an alternative build approach with simpler config
    const simpleConfig = `
      import { defineConfig } from 'vite';
      import react from '@vitejs/plugin-react';
      
      export default defineConfig({
        plugins: [react()],
        build: {
          outDir: 'dist/public',
        },
      });
    `;
    
    fs.writeFileSync('vite.config.simple.js', simpleConfig, 'utf8');
    execSync('npx vite build --config vite.config.simple.js', { stdio: 'inherit' });
  }
  
  // Build the server
  console.log('🏗️ Building the server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  // Prepare Netlify files
  console.log('📝 Preparing Netlify files...');
  require('./prepare-netlify.cjs');
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}