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
  
  // Run the build
  console.log('🏗️ Building the application...');
  execSync('npx vite build', { stdio: 'inherit' });
  
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