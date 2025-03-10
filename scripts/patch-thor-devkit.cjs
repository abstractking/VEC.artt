#!/usr/bin/env node

/**
 * This script patches the thor-devkit package to use browser-compatible versions
 * of Node.js core modules. This is necessary for building in Netlify environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory paths
const nodeModulesDir = path.resolve('./node_modules');
const thorDevkitDir = path.join(nodeModulesDir, 'thor-devkit');

// Check if thor-devkit package exists
if (!fs.existsSync(thorDevkitDir)) {
  console.error('❌ thor-devkit package not found in node_modules. Skipping patching.');
  process.exit(0);
}

console.log('🔧 Starting thor-devkit patching process for browser compatibility...');

// Function to recursively find files
function findFiles(dir, pattern, callback) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, pattern, callback);
    } else if (pattern.test(file)) {
      callback(filePath);
    }
  }
}

// Function to replace crypto imports in a file
function patchFile(filePath) {
  console.log(`📄 Patching file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace require('crypto') with browser-compatible version
  if (content.includes("require('crypto')") || content.includes('require("crypto")')) {
    content = content.replace(
      /const\s+(?:crypto|[{}\s\w,]+)\s*=\s*require\(['"]crypto['"]\)/g,
      "const crypto = require('../../../client/src/lib/thor-polyfills')"
    );
    modified = true;
  }
  
  // Replace import from 'crypto' with browser-compatible version
  if (content.includes("from 'crypto'") || content.includes('from "crypto"')) {
    content = content.replace(
      /import\s+(?:[{}\s\w,]+)\s+from\s+['"]crypto['"]/g,
      "import * as crypto from '../../../client/src/lib/thor-polyfills'"
    );
    modified = true;
  }
  
  // Replace references to Buffer with browser-compatible version
  if (content.includes('new Buffer(') || content.includes('Buffer.from(')) {
    content = content.replace(
      /new Buffer\(/g,
      'Buffer.from('
    );
    modified = true;
  }
  
  // Replace secp256k1 with browser-compatible version
  if (content.includes("require('secp256k1')") || content.includes('require("secp256k1")')) {
    content = content.replace(
      /const\s+(?:secp256k1|[{}\s\w,]+)\s*=\s*require\(['"]secp256k1['"]\)/g,
      "const secp256k1 = require('../../../client/src/lib/secp256k1-browser')"
    );
    modified = true;
  }
  
  // Replace other Node.js specific modules
  const nodeModules = ['fs', 'path', 'os', 'stream', 'http', 'https', 'zlib', 'child_process', 'events'];
  for (const mod of nodeModules) {
    const requireRegex = new RegExp(`require\\(['"]${mod}['"]\\)`, 'g');
    const importRegex = new RegExp(`import\\s+(?:[{\\}\\s\\w,]+)\\s+from\\s+['"]${mod}['"]`, 'g');
    
    if (requireRegex.test(content)) {
      content = content.replace(requireRegex, `require('../../../client/src/${mod}-browserify')`);
      modified = true;
    }
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `import * as ${mod} from '../../../client/src/${mod}-browserify'`);
      modified = true;
    }
  }
  
  // Write changes if modified
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched: ${filePath}`);
  } else {
    console.log(`⏩ No changes needed: ${filePath}`);
  }
}

// Find and patch .js files in thor-devkit directory
console.log('🔍 Searching for JavaScript files in thor-devkit package...');
findFiles(thorDevkitDir, /\.(js|mjs)$/, patchFile);

// Find and patch .d.ts files in thor-devkit directory to avoid TypeScript errors
console.log('🔍 Searching for TypeScript declaration files in thor-devkit package...');
findFiles(thorDevkitDir, /\.d\.ts$/, patchFile);

console.log('🎉 thor-devkit patching completed successfully!');
console.log('⚠️ Note: This patching is only needed for browser environments. The original functionality is preserved for Node.js environments.');