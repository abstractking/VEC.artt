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
  
  // Create the polyfill stub directly to avoid path issues
  console.log('📝 Creating polyfill stub...');
  const polyfillContent = `/**
 * This script gets injected directly into the HTML before any modules load
 * It provides minimal polyfills needed for initialization
 */

// Ensure crypto is available early
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

// Ensure Buffer is available early
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = {
    from: function(data) {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(data);
    },
    isBuffer: function() { return false; }
  };
}

// Minimal global needed for some libraries
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Log that polyfills are initialized
console.log('Critical polyfills initialized via inline script');`;

  // Ensure the directory exists
  const polyfillDir = path.join(__dirname, '../client/src');
  if (!fs.existsSync(polyfillDir)) {
    fs.mkdirSync(polyfillDir, { recursive: true });
  }
  fs.writeFileSync(path.join(polyfillDir, 'polyfill-stub.js'), polyfillContent, 'utf8');
  
  // Install development dependencies needed for the build using the package.json approach
  console.log('🔍 Installing ALL dependencies (including dev dependencies)...');
  
  // Force full dependency installation from package.json instead of selective installation
  execSync('npm install --include=dev', { stdio: 'inherit' });
  
  // Also install the critical packages explicitly in case they were missed
  console.log('🔍 Installing critical packages explicitly...');
  execSync('npm install --no-save @vitejs/plugin-react vite-plugin-node-polyfills typescript crypto-browserify buffer', { stdio: 'inherit' });
  
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
  
  // Inject polyfills directly into index.html
  console.log('🔧 Injecting polyfills into HTML template...');
  const injectPolyfill = require('./inject-polyfill.cjs');
  injectPolyfill.injectPolyfillToHTML(path.join(__dirname, '../public/index.html'));
  
  // Run the build with detailed output
  console.log('🏗️ Building the application...');
  
  // Create a temporary vite config for the build
  console.log('📝 Preparing build configuration...');
  const tempConfig = `
    // Generated temporary vite config for Netlify build
    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import { nodePolyfills } from 'vite-plugin-node-polyfills';
    import { readFileSync } from 'fs';
    import { resolve } from 'path';
    
    // Make sure to use the correct absolute path
    const polyfillScript = readFileSync(resolve(__dirname, '../client/src/polyfill-stub.js'), 'utf-8');
    
    export default defineConfig({
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
        // Insert the polyfill script at the top of the page
        {
          name: 'inject-polyfill',
          transformIndexHtml(html) {
            return html.replace(
              '<head>',
              \`<head><script>\${polyfillScript}</script>\`
            );
          }
        }
      ],
      define: {
        'process.env': process.env,
        'window.global': 'window',
        'global': 'window',
      },
      build: {
        outDir: 'dist/public',
        emptyOutDir: true,
        sourcemap: true,
        commonjsOptions: {
          transformMixedEsModules: true,
        },
      },
      optimizeDeps: {
        include: ['crypto-browserify', 'buffer', 'process', 'stream-browserify'],
        esbuildOptions: {
          target: 'es2020',
        },
      },
      resolve: {
        alias: {
          '@': '/client/src',
          '@shared': '/shared',
          'stream': 'stream-browserify',
          'crypto': 'crypto-browserify',
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
      import { readFileSync } from 'fs';
      import { resolve } from 'path';
      
      // Read the polyfill script - with correct path
      const polyfillScript = readFileSync(resolve(__dirname, '../client/src/polyfill-stub.js'), 'utf-8');
      
      export default defineConfig({
        plugins: [
          react(),
          // Basic plugin to inject our polyfill script
          {
            name: 'minimal-inject-polyfill',
            transformIndexHtml(html) {
              return html.replace(
                '<head>',
                \`<head><script>\${polyfillScript}</script>\`
              );
            }
          }
        ],
        build: {
          outDir: 'dist/public',
        },
        define: {
          'global': 'window',
          'process.env': process.env
        }
      });
    `;
    
    fs.writeFileSync('vite.config.simple.js', simpleConfig, 'utf8');
    
    try {
      execSync('npx vite build --config vite.config.simple.js', { stdio: 'inherit' });
    } catch (err) {
      console.error('Simple config failed too, trying minimal config...');
      
      // Create a super minimal vite.config.js as the last resort
      const minimalConfig = `
        import { defineConfig } from 'vite';
        import react from '@vitejs/plugin-react';
        
        export default defineConfig({
          plugins: [react()],
          build: {
            outDir: 'dist/public',
          }
        });
      `;
      
      fs.writeFileSync('vite.config.js', minimalConfig, 'utf8');
      execSync('npx vite build', { stdio: 'inherit' });
    }
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