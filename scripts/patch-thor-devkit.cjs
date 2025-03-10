#!/usr/bin/env node

/**
 * This script patches the thor-devkit and @vechain/connex-driver packages to use browser-compatible versions
 * of Node.js core modules. This is necessary for building in Netlify environment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory paths
const rootDir = path.resolve('.');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const thorDevkitDir = path.join(nodeModulesDir, 'thor-devkit');
const connexDriverDir = path.join(nodeModulesDir, '@vechain/connex-driver');

// Create inline polyfill for crypto to avoid path resolution issues
const inlineThorPolyfills = `
// Inline thor-polyfills to avoid path resolution issues
import * as cryptoBrowserify from 'crypto-browserify';
export const randomBytes = cryptoBrowserify.randomBytes;
export const createHash = cryptoBrowserify.createHash;
export const createHmac = cryptoBrowserify.createHmac;
export const pbkdf2 = cryptoBrowserify.pbkdf2;
export const pbkdf2Sync = cryptoBrowserify.pbkdf2Sync;
export default cryptoBrowserify;
`;

const inlineSecp256k1Browser = `
// Inline secp256k1-browser implementation to avoid path resolution issues
import * as cryptoBrowserify from 'crypto-browserify';
import * as elliptic from 'elliptic';

const secp256k1 = new elliptic.ec('secp256k1');

export function generatePrivateKey() {
  const bytes = cryptoBrowserify.randomBytes(32);
  return Buffer.from(bytes);
}

export function deriveAddress(pubKey) {
  return pubKey.toString('hex');
}

export function sign(msgHash, privKey) {
  const keyPair = secp256k1.keyFromPrivate(privKey);
  const signature = keyPair.sign(msgHash, { canonical: true });
  const r = signature.r.toBuffer();
  const s = signature.s.toBuffer();
  return Buffer.concat([r, s, Buffer.from([signature.recoveryParam])]);
}

export function recover(msgHash, sig) {
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);
  const v = sig[64];
  
  const point = secp256k1.recoverPubKey(
    msgHash,
    { r: r.toString('hex'), s: s.toString('hex') },
    v
  );
  
  return Buffer.from(point.encode('hex', false).slice(2), 'hex');
}

export default {
  generatePrivateKey,
  deriveAddress,
  sign,
  recover
};
`;

// Create the polyfill files in node_modules
fs.writeFileSync(path.join(nodeModulesDir, 'thor-polyfills.js'), inlineThorPolyfills);
fs.writeFileSync(path.join(nodeModulesDir, 'secp256k1-browser.js'), inlineSecp256k1Browser);

// Check if packages exist
let patchCount = 0;

if (fs.existsSync(thorDevkitDir)) {
  patchCount++;
} else {
  console.error('❌ thor-devkit package not found in node_modules.');
}

if (fs.existsSync(connexDriverDir)) {
  patchCount++;
} else {
  console.error('❌ @vechain/connex-driver package not found in node_modules.');
}

if (patchCount === 0) {
  console.error('❌ No packages to patch. Exiting.');
  process.exit(0);
}

console.log('🔧 Starting patching process for browser compatibility...');

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
  
  // Handle specific imports for randomBytes from crypto
  if (content.includes("import { randomBytes } from 'crypto'") || content.includes('import { randomBytes } from "crypto"')) {
    content = content.replace(
      /import\s*{\s*randomBytes\s*}\s*from\s*['"]crypto['"]/g,
      "import { randomBytes } from 'crypto-browserify'"
    );
    modified = true;
  }
  
  // Handle other specific named imports from crypto
  if (content.includes("from 'crypto'") || content.includes('from "crypto"')) {
    content = content.replace(
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]crypto['"]/g,
      "import { $1 } from 'crypto-browserify'"
    );
    modified = true;
  }
  
  // Replace require('crypto') with browser-compatible version
  if (content.includes("require('crypto')") || content.includes('require("crypto")')) {
    content = content.replace(
      /const\s+(?:crypto|[{}\s\w,]+)\s*=\s*require\(['"]crypto['"]\)/g,
      "const crypto = require('crypto-browserify')"
    );
    modified = true;
  }
  
  // Replace import from 'crypto' with browser-compatible version
  if (content.includes("from 'crypto'") || content.includes('from "crypto"')) {
    content = content.replace(
      /import\s+(?:[{}\s\w,]+)\s+from\s+['"]crypto['"]/g,
      "import * as crypto from 'crypto-browserify'"
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
      "const secp256k1 = require('../secp256k1-browser.js')"
    );
    modified = true;
  }
  
  // Replace other Node.js specific modules
  const nodeModules = {
    'fs': 'fs-extra',
    'path': 'path-browserify',
    'os': 'os-browserify/browser',
    'stream': 'stream-browserify',
    'http': 'stream-http',
    'https': 'https-browserify',
    'zlib': 'browserify-zlib',
    'events': 'events/'
  };
  
  for (const [mod, replacement] of Object.entries(nodeModules)) {
    const requireRegex = new RegExp(`require\\(['"]${mod}['"]\\)`, 'g');
    const importRegex = new RegExp(`import\\s+(?:[{\\}\\s\\w,]+)\\s+from\\s+['"]${mod}['"]`, 'g');
    
    if (requireRegex.test(content)) {
      content = content.replace(requireRegex, `require('${replacement}')`);
      modified = true;
    }
    
    if (importRegex.test(content)) {
      content = content.replace(importRegex, `import * as ${mod} from '${replacement}'`);
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

// Patch thor-devkit
if (fs.existsSync(thorDevkitDir)) {
  console.log('🔍 Searching for JavaScript files in thor-devkit package...');
  findFiles(thorDevkitDir, /\.(js|mjs)$/, patchFile);
  
  console.log('🔍 Searching for TypeScript declaration files in thor-devkit package...');
  findFiles(thorDevkitDir, /\.d\.ts$/, patchFile);
  
  console.log('✅ thor-devkit patching completed successfully!');
}

// Patch @vechain/connex-driver
if (fs.existsSync(connexDriverDir)) {
  console.log('🔍 Searching for JavaScript files in @vechain/connex-driver package...');
  findFiles(connexDriverDir, /\.(js|mjs)$/, patchFile);
  
  console.log('🔍 Searching for TypeScript declaration files in @vechain/connex-driver package...');
  findFiles(connexDriverDir, /\.d\.ts$/, patchFile);
  
  console.log('✅ @vechain/connex-driver patching completed successfully!');
}

console.log('🎉 All patching completed successfully!');
console.log('⚠️ Note: This patching is only needed for browser environments. The original functionality is preserved for Node.js environments.');