/**
 * Post-Build Script for Vercel Deployment
 * 
 * This script runs after the Vite build process completes on Vercel.
 * It performs several optimizations and fixes to ensure the built
 * application works correctly in Vercel's environment.
 */

const fs = require('fs');
const path = require('path');

// Constants for paths
const PUBLIC_DIR = path.resolve(__dirname, '../dist/public');
const INDEX_HTML = path.resolve(PUBLIC_DIR, 'index.html');
const ASSETS_DIR = path.resolve(PUBLIC_DIR, 'assets');

console.log('🔧 Running post-build optimizations for Vercel deployment...');

// Function to recursively list all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

// Function to ensure a directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// 1. Ensure API directory exists at the destination (Vercel serverless functions requirement)
const apiDestDir = path.resolve(__dirname, '../dist/api');
ensureDirectoryExists(apiDestDir);

// 2. Copy API adapter to the correct location
const apiSourceFile = path.resolve(__dirname, '../api/index.js');
const apiDestFile = path.resolve(apiDestDir, 'index.js');

try {
  if (fs.existsSync(apiSourceFile)) {
    fs.copyFileSync(apiSourceFile, apiDestFile);
    console.log(`✅ Copied API adapter to ${apiDestFile}`);
  } else {
    console.error(`❌ API source file not found: ${apiSourceFile}`);
  }
} catch (error) {
  console.error(`❌ Error copying API adapter: ${error.message}`);
}

// 3. Ensure all HTML files include the critical polyfills
try {
  if (fs.existsSync(INDEX_HTML)) {
    let htmlContent = fs.readFileSync(INDEX_HTML, 'utf8');
    
    // Check if polyfills are already included
    if (!htmlContent.includes('vercel-polyfills.js') && !htmlContent.includes('Critical polyfills initialized via Vercel')) {
      // Add polyfill script before the first script tag
      htmlContent = htmlContent.replace(
        '<head>',
        `<head>
    <!-- Vercel polyfills -->
    <script>
      // Define global object
      window.global = window;
      global = window;
      
      // Define process object with minimal properties needed
      window.process = window.process || {
        env: {},
        nextTick: function(cb) { setTimeout(cb, 0); },
        browser: true,
        version: '',
        versions: {},
        platform: 'browser'
      };
      
      // Define Buffer placeholder
      window.Buffer = window.Buffer || { 
        from: function() { return []; },
        isBuffer: function() { return false; }
      };
      
      console.log("Critical polyfills initialized via Vercel inline script");
    </script>`
      );
      
      fs.writeFileSync(INDEX_HTML, htmlContent);
      console.log('✅ Added inline polyfills to index.html');
    } else {
      console.log('✅ Polyfills already present in index.html');
    }
  } else {
    console.error(`❌ Index HTML file not found: ${INDEX_HTML}`);
  }
} catch (error) {
  console.error(`❌ Error modifying HTML: ${error.message}`);
}

// 4. Copy static assets from public folder if needed
const publicSourceDir = path.resolve(__dirname, '../public');
if (fs.existsSync(publicSourceDir)) {
  try {
    const publicFiles = getAllFiles(publicSourceDir);
    publicFiles.forEach(filePath => {
      const relativePath = path.relative(publicSourceDir, filePath);
      const destPath = path.join(PUBLIC_DIR, relativePath);
      
      // Ensure the destination directory exists
      const destDir = path.dirname(destPath);
      ensureDirectoryExists(destDir);
      
      // Copy the file
      fs.copyFileSync(filePath, destPath);
    });
    console.log('✅ Copied public assets to build output');
  } catch (error) {
    console.error(`❌ Error copying public assets: ${error.message}`);
  }
}

// 5. Create a verification file to confirm the build completed successfully
const verificationFile = path.join(PUBLIC_DIR, 'vercel-build-verification.json');
try {
  fs.writeFileSync(
    verificationFile,
    JSON.stringify({
      buildTimestamp: new Date().toISOString(),
      buildType: 'vercel',
      success: true
    }, null, 2)
  );
  console.log('✅ Created build verification file');
} catch (error) {
  console.error(`❌ Error creating verification file: ${error.message}`);
}

console.log('✅ Post-build optimizations completed');