#!/usr/bin/env node

/**
 * This script creates browser-compatible versions of VeChain's modules
 * to address the specific issue with thor-devkit and connex-driver in browser environments.
 */

const fs = require('fs');
const path = require('path');

// Directory paths
const rootDir = path.resolve('.');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const clientLibDir = path.join(rootDir, 'client/src/lib');

// Make sure the directory exists
if (!fs.existsSync(clientLibDir)) {
  fs.mkdirSync(clientLibDir, { recursive: true });
}

// Create browser-compatible Thor polyfills
const thorPolyfillContent = `/**
 * Crypto browser-compatible polyfills for thor-devkit
 */
import crypto from 'crypto-browserify';

// Named exports
export const randomBytes = crypto.randomBytes;
export const createHash = crypto.createHash;
export const createHmac = crypto.createHmac;
export const pbkdf2 = crypto.pbkdf2;
export const pbkdf2Sync = crypto.pbkdf2Sync;

// Default export
export default crypto;
`;

// Create browser-compatible secp256k1 implementation
const secp256k1Content = `/**
 * Browser-compatible implementation of secp256k1 for thor-devkit
 */
import * as elliptic from 'elliptic';
import { randomBytes } from 'crypto-browserify';

const secp256k1 = new elliptic.ec('secp256k1');

export function generatePrivateKey() {
  const bytes = randomBytes(32);
  return Buffer.from(bytes);
}

export function deriveAddress(pubKey) {
  return pubKey.toString('hex');
}

export function sign(msgHash, privKey) {
  const keyPair = secp256k1.keyFromPrivate(privKey);
  const signature = keyPair.sign(msgHash, { canonical: true });
  const r = Buffer.from(signature.r.toArray());
  const s = Buffer.from(signature.s.toArray());
  return Buffer.concat([r, s, Buffer.from([signature.recoveryParam])]);
}

export function recover(msgHash, sig) {
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);
  const v = sig[64];
  
  const point = secp256k1.recoverPubKey(
    Buffer.from(msgHash).toString('hex'),
    { r: Buffer.from(r).toString('hex'), s: Buffer.from(s).toString('hex') },
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

// Write files
fs.writeFileSync(path.join(clientLibDir, 'thor-polyfills.js'), thorPolyfillContent);
fs.writeFileSync(path.join(clientLibDir, 'secp256k1-browser.js'), secp256k1Content);

console.log('✅ Created browser-compatible polyfill files:');
console.log(`   - ${path.join(clientLibDir, 'thor-polyfills.js')}`);
console.log(`   - ${path.join(clientLibDir, 'secp256k1-browser.js')}`);

// Create a re-export for Node.js modules used by Vite
const nodeModulesReExports = [
  { name: 'crypto', target: 'crypto-browserify' },
  { name: 'stream', target: 'stream-browserify' },
  { name: 'http', target: 'stream-http' },
  { name: 'https', target: 'https-browserify' },
  { name: 'zlib', target: 'browserify-zlib' },
  { name: 'process', target: 'process/browser' },
  { name: 'buffer', target: 'buffer' },
  { name: 'events', target: 'events' },
  { name: 'util', target: 'util' },
  { name: 'url', target: 'url' },
  { name: 'path', target: 'path-browserify' },
  { name: 'os', target: 'os-browserify/browser' },
  { name: 'fs', target: 'memfs' },
  { name: 'assert', target: 'assert' },
];

nodeModulesReExports.forEach(({ name, target }) => {
  const reExportContent = `// Re-export browser-compatible ${name} module
export * from '${target}';
export { default } from '${target}';
`;
  fs.writeFileSync(path.join(clientLibDir, `${name}-browserify.js`), reExportContent);
  console.log(`   - ${path.join(clientLibDir, `${name}-browserify.js`)}`);
});

console.log('✅ All browser compatibility files created successfully!');