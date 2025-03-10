/**
 * Post-build script for Netlify deployments
 * This script processes and copies files needed for Netlify deployment:
 * - Copies _redirects file for SPA routing
 * - Creates _headers file for security headers
 * - Verifies the structure of the build directory
 * - Ensures all necessary assets are available
 */

const fs = require('fs');
const path = require('path');

// Define paths
const redirectsSource = path.join(__dirname, '../public/_redirects');
const redirectsDestination = path.join(__dirname, '../dist/public/_redirects');
const rootRedirectsDestination = path.join(__dirname, '../dist/_redirects');

// Create directories if they don't exist
const destDir = path.dirname(redirectsDestination);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

const rootDestDir = path.dirname(rootRedirectsDestination);
if (!fs.existsSync(rootDestDir)) {
  fs.mkdirSync(rootDestDir, { recursive: true });
  console.log(`Created directory: ${rootDestDir}`);
}

// Copy _redirects file to build output folders (both root and public)
try {
  // Copy to the public directory
  fs.copyFileSync(redirectsSource, redirectsDestination);
  console.log(`Successfully copied _redirects file to: ${redirectsDestination}`);
  
  // Copy to the root dist directory as a fallback
  fs.copyFileSync(redirectsSource, rootRedirectsDestination);
  console.log(`Successfully copied _redirects file to: ${rootRedirectsDestination}`);
} catch (error) {
  console.error(`Error copying _redirects file: ${error.message}`);
  process.exit(1);
}

// Create a special _headers file for Netlify
const headersContent = `
# Headers for all files
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer-when-downgrade

# Cache assets for a year
/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

try {
  fs.writeFileSync(path.join(__dirname, '../dist/public/_headers'), headersContent);
  console.log('Successfully created _headers file for Netlify');
} catch (error) {
  console.error(`Error creating _headers file: ${error.message}`);
}

// Verify the structure of the build directory
try {
  const publicDir = path.join(__dirname, '../dist/public');
  const indexFile = path.join(publicDir, 'index.html');
  const assetsDir = path.join(publicDir, 'assets');
  
  if (!fs.existsSync(publicDir)) {
    console.error('Error: dist/public directory does not exist!');
    process.exit(1);
  }
  
  if (!fs.existsSync(indexFile)) {
    console.error('Error: index.html does not exist in the build output!');
    process.exit(1);
  }
  
  if (!fs.existsSync(assetsDir)) {
    console.warn('Warning: assets directory does not exist in the build output!');
  } else {
    const assetFiles = fs.readdirSync(assetsDir);
    console.log(`Found ${assetFiles.length} files in the assets directory.`);
  }
  
  console.log('Build directory verification complete.');
} catch (error) {
  console.error(`Error verifying build directory: ${error.message}`);
}

console.log('Netlify deployment preparation completed successfully.');