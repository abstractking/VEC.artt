#!/usr/bin/env node

/**
 * This script patches the thor-devkit package to use browser-compatible versions
 * of Node.js core modules. This is necessary for building in Netlify environment.
 */

const fs = require('fs');
const path = require('path');

// Path to the secp256k1.js file in the thor-devkit package
const thorDevkitSecp256k1Path = path.resolve(
  __dirname,
  '../node_modules/thor-devkit/esm/secp256k1.js'
);

// Only proceed if the file exists
if (fs.existsSync(thorDevkitSecp256k1Path)) {
  console.log(`Patching thor-devkit secp256k1.js for browser compatibility...`);
  
  // Original content with Node.js crypto import
  const originalContent = fs.readFileSync(thorDevkitSecp256k1Path, 'utf8');
  
  // Replace the Node.js crypto import with crypto-browserify
  const patchedContent = originalContent.replace(
    `import { randomBytes } from 'crypto';`,
    `import { randomBytes } from 'crypto-browserify';`
  );
  
  // Write the patched file back
  fs.writeFileSync(thorDevkitSecp256k1Path, patchedContent, 'utf8');
  
  console.log(`✅ Successfully patched thor-devkit for browser compatibility.`);
} else {
  console.error(`❌ Could not find thor-devkit secp256k1.js at ${thorDevkitSecp256k1Path}`);
  process.exit(1);
}