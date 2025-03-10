#!/usr/bin/env node

/**
 * Improved patching script for thor-devkit and connex-driver
 * that addresses Netlify build issues with path resolution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory paths
const rootDir = path.resolve('.');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const thorDevkitDir = path.join(nodeModulesDir, 'thor-devkit');
const connexDriverDir = path.join(nodeModulesDir, '@vechain/connex-driver');
const clientLibDir = path.join(rootDir, 'client/src/lib');

// Ensure library directory exists
if (!fs.existsSync(clientLibDir)) {
  fs.mkdirSync(clientLibDir, { recursive: true });
}

console.log('🔧 Starting improved patching process for browser compatibility...');

// Function to recursively find files
function findFiles(dir, pattern, callback) {
  if (!fs.existsSync(dir)) return;
  
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

// Function to patch thor-devkit and vechain/connex-driver
function patchFile(filePath) {
  console.log(`📄 Patching file: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Handle crypto imports
  if (content.includes("require('crypto')") || content.includes('require("crypto")')) {
    content = content.replace(
      /(?:const|let|var)?\s*(?:crypto|[{}\s\w,]+)\s*=\s*require\(['"]crypto['"]\)/g,
      "const crypto = require('crypto-browserify')"
    );
    modified = true;
  }
  
  if (content.includes("import") && (content.includes("from 'crypto'") || content.includes('from "crypto"'))) {
    // Handle named imports from crypto
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]crypto['"]/g,
      "import { $1 } from 'crypto-browserify'"
    );
    
    // Handle default import from crypto
    content = content.replace(
      /import\s+([a-zA-Z0-9_]+)\s+from\s+['"]crypto['"]/g,
      "import $1 from 'crypto-browserify'"
    );
    
    modified = true;
  }
  
  // Replace references to Buffer constructor
  if (content.includes('new Buffer(')) {
    content = content.replace(/new Buffer\(/g, 'Buffer.from(');
    modified = true;
  }
  
  // Replace secp256k1 imports
  if (content.includes("require('secp256k1')") || content.includes('require("secp256k1")')) {
    content = content.replace(
      /(?:const|let|var)?\s*(?:secp256k1|[{}\s\w,]+)\s*=\s*require\(['"]secp256k1['"]\)/g,
      "const secp256k1 = require('elliptic').ec('secp256k1')"
    );
    modified = true;
  }
  
  if (content.includes("import") && (content.includes("from 'secp256k1'") || content.includes('from "secp256k1"'))) {
    content = content.replace(
      /import\s*.*\s*from\s*['"]secp256k1['"]/g,
      "import { ec } from 'elliptic'; const secp256k1 = new ec('secp256k1')"
    );
    modified = true;
  }
  
  // Replace Node.js specific modules with browser-compatible versions
  const nodeModules = {
    'fs': null, // We'll skip this completely
    'path': 'path-browserify',
    'os': 'os-browserify/browser',
    'stream': 'stream-browserify',
    'http': 'stream-http',
    'https': 'https-browserify',
    'zlib': 'browserify-zlib',
    'url': 'url',
    'util': 'util',
    'assert': 'assert',
    'events': 'events',
  };
  
  for (const [mod, replacement] of Object.entries(nodeModules)) {
    if (!replacement) continue; // Skip null replacements (like fs)
    
    // Replace require statements
    const requirePattern = new RegExp(`require\\(['"]${mod}['"]\\)`, 'g');
    if (requirePattern.test(content)) {
      content = content.replace(requirePattern, `require('${replacement}')`);
      modified = true;
    }
    
    // Replace import statements
    const importPattern = new RegExp(`import\\s+(?:[{\\}\\s\\w,]+)\\s+from\\s+['"]${mod}['"]`, 'g');
    if (importPattern.test(content)) {
      content = content.replace(importPattern, `import * as ${mod} from '${replacement}'`);
      modified = true;
    }
  }
  
  // Remove fs imports/requires completely
  content = content.replace(/(?:const|let|var)?\s*(?:fs|[{}\s\w,]+)\s*=\s*require\(['"]fs['"]\);?/g, '// fs require removed for browser compatibility');
  content = content.replace(/import\s*.*\s*from\s*['"]fs['"];?/g, '// fs import removed for browser compatibility');
  
  // Write changes
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Patched: ${filePath}`);
  } else {
    console.log(`⏩ No changes needed: ${filePath}`);
  }
}

// Create empty fs module for browser compatibility
const fsBrowserifyContent = `// Browser-compatible fs stub
export function readFileSync() { 
  throw new Error('readFileSync is not supported in the browser'); 
}

export function writeFileSync() { 
  throw new Error('writeFileSync is not supported in the browser'); 
}

export function existsSync() { 
  return false; 
}

export function mkdirSync() { 
  throw new Error('mkdirSync is not supported in the browser'); 
}

export default {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync
};
`;

fs.writeFileSync(path.join(clientLibDir, 'fs-browserify.js'), fsBrowserifyContent);
console.log(`✅ Created browser-compatible fs polyfill: ${path.join(clientLibDir, 'fs-browserify.js')}`);

// Create browserify version of thor-devkit's crypto dependency
const thorCryptoPolyfillContent = `/**
 * Thor-specific polyfills for crypto functions
 */
import * as cryptoBrowserify from 'crypto-browserify';

// Create a custom implementation of Node's crypto module
const thorCrypto = {
  // Implement the exact functions used by thor-devkit
  randomBytes: (size) => {
    return Buffer.from(cryptoBrowserify.randomBytes(size));
  },
  createHash: (algorithm) => {
    return cryptoBrowserify.createHash(algorithm);
  },
  createHmac: (algorithm, key) => {
    return cryptoBrowserify.createHmac(algorithm, key);
  }
};

// Named exports
export const randomBytes = thorCrypto.randomBytes;
export const createHash = thorCrypto.createHash;
export const createHmac = thorCrypto.createHmac;

// Default export
export default thorCrypto;`;

fs.writeFileSync(path.join(clientLibDir, 'thor-polyfills.ts'), thorCryptoPolyfillContent);
console.log(`✅ Created thor-devkit crypto polyfill: ${path.join(clientLibDir, 'thor-polyfills.ts')}`);

// Patch thor-devkit
if (fs.existsSync(thorDevkitDir)) {
  console.log('🔍 Patching thor-devkit package...');
  findFiles(thorDevkitDir, /\.(js|mjs)$/, patchFile);
  console.log('✅ thor-devkit patching completed successfully!');
} else {
  console.log('⚠️ thor-devkit package not found, skipping...');
}

// Patch connex-driver
if (fs.existsSync(connexDriverDir)) {
  console.log('🔍 Patching @vechain/connex-driver package...');
  findFiles(connexDriverDir, /\.(js|mjs)$/, patchFile);
  console.log('✅ @vechain/connex-driver patching completed successfully!');
} else {
  console.log('⚠️ @vechain/connex-driver package not found, skipping...');
}

// Create modified browser-env.js file
const browserEnvContent = `// This file is automatically included in client/index.html
// to provide necessary polyfills for the browser environment

// Make Buffer available globally
import { Buffer } from 'buffer';
window.Buffer = window.Buffer || Buffer;

// Make process available globally
import process from 'process';
window.process = window.process || process;

// Make sure global is available
window.global = window.global || window;

// Make Node.js crypto available through window
import * as cryptoBrowserify from 'crypto-browserify';
window.cryptoPolyfill = cryptoBrowserify;

// Additional browser polyfills
import * as streamBrowserify from 'stream-browserify';
window.stream = streamBrowserify;

import * as httpBrowserify from 'stream-http';
window.http = httpBrowserify;

import * as httpsBrowserify from 'https-browserify';
window.https = httpsBrowserify;

import * as osBrowserify from 'os-browserify/browser';
window.os = osBrowserify;

import * as assertBrowserify from 'assert';
window.assert = assertBrowserify;

// Log polyfill initialization
console.log('Browser environment polyfills initialized');
`;

fs.writeFileSync(path.join(clientLibDir, 'polyfills.ts'), browserEnvContent);
console.log(`✅ Created browser environment polyfills: ${path.join(clientLibDir, 'polyfills.ts')}`);

// Create main.tsx import statement
const mainTsxAppend = `
// Import polyfills
import './lib/polyfills';
`;

try {
  const mainTsxPath = path.join(rootDir, 'client/src/main.tsx');
  if (fs.existsSync(mainTsxPath)) {
    let mainTsxContent = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Only add the polyfill import if it's not already there
    if (!mainTsxContent.includes('./lib/polyfills')) {
      // Add the import near the top of the file, after other imports
      const importEndIndex = mainTsxContent.lastIndexOf('import');
      const importEndLine = mainTsxContent.indexOf('\n', importEndIndex);
      
      if (importEndLine !== -1) {
        mainTsxContent = 
          mainTsxContent.substring(0, importEndLine + 1) + 
          mainTsxAppend + 
          mainTsxContent.substring(importEndLine + 1);
          
        fs.writeFileSync(mainTsxPath, mainTsxContent, 'utf8');
        console.log(`✅ Updated ${mainTsxPath} with polyfill import`);
      }
    } else {
      console.log(`⏩ Polyfill import already exists in ${mainTsxPath}`);
    }
  }
} catch (err) {
  console.error(`❌ Error updating main.tsx: ${err.message}`);
}

console.log('🎉 All patching completed successfully!');
console.log('⚠️ Note: This patching is only needed for browser environments. The original functionality is preserved for Node.js environments.');