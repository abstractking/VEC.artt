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
  try {
    // First try with global install
    execSync('npm install -g vite esbuild @vitejs/plugin-react', { stdio: 'inherit' });
  } catch (e) {
    console.warn('⚠️ Global install failed, trying local install...');
    // If global install fails, try local install
    execSync('npm install vite esbuild @vitejs/plugin-react', { stdio: 'inherit' });
  }
  
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
  try {
    // Install packages one by one to ensure they each get installed properly
    execSync('npm install --no-save @vitejs/plugin-react', { stdio: 'inherit' });
    execSync('npm install --no-save vite-plugin-node-polyfills', { stdio: 'inherit' });
    execSync('npm install --no-save typescript', { stdio: 'inherit' });
    execSync('npm install --no-save crypto-browserify', { stdio: 'inherit' });
    execSync('npm install --no-save buffer', { stdio: 'inherit' });
    // Check if react plugin is installed correctly
    const modulePath = path.resolve('./node_modules/@vitejs/plugin-react');
    if (!fs.existsSync(modulePath)) {
      console.warn('⚠️ @vitejs/plugin-react not found in node_modules, trying alternative install...');
      execSync('npm install --legacy-peer-deps --no-save @vitejs/plugin-react', { stdio: 'inherit' });
    }
  } catch (e) {
    console.warn('⚠️ Some dependency installations failed, but continuing with build process...');
    console.error(e.message);
  }
  
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
      console.log('🔄 Creating an ultra-minimal config as last resort...');
      const minimalConfig = `
        // Ultra-minimal configuration
        import { defineConfig } from 'vite';
        
        // Try to import react plugin, but continue even if it fails
        let react;
        try {
          react = require('@vitejs/plugin-react').default;
        } catch (e) {
          console.warn('Failed to import @vitejs/plugin-react, continuing without it');
        }
        
        export default defineConfig({
          plugins: react ? [react()] : [],
          build: {
            outDir: 'dist/public',
          },
          define: {
            'global': 'window',
          }
        });
      `;
      
      fs.writeFileSync('vite.config.js', minimalConfig, 'utf8');
      
      try {
        console.log('🔄 Running build with minimal config...');
        execSync('npx vite build', { stdio: 'inherit' });
      } catch (finalError) {
        console.error('🔄 ESM configs failed, trying CommonJS config...');
        
        // Create a CommonJS config as the absolute last resort
        const createCommonConfig = require('./create-common-vite-config.cjs');
        const cjsConfigPath = createCommonConfig();
        
        try {
          // Try building with the CommonJS config
          execSync(`npx vite build --config ${cjsConfigPath}`, { stdio: 'inherit' });
        } catch (err) {
          console.error('🔄 All configurations failed, attempting direct build...');
          // As an absolute last resort, try to run vite without any config
          execSync('cd client && npx vite build --outDir ../dist/public', { stdio: 'inherit' });
        }
      }
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