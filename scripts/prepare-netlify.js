/**
 * Post-build script for Netlify deployments
 * This script copies the _redirects file to the build output directory
 * to ensure proper client-side routing on Netlify
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

console.log('Netlify deployment preparation completed successfully.');