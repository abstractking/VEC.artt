/**
 * Polyfills for thor-devkit Node.js dependencies
 * This file provides browser-compatible implementations of Node.js crypto functions
 */

import * as cryptoBrowserify from 'crypto-browserify';

// Create a custom implementation of Node's crypto module to match what thor-devkit expects
const thorCrypto = {
  // Implement the exact functions used by thor-devkit
  randomBytes: (size: number): Buffer => {
    return Buffer.from(cryptoBrowserify.randomBytes(size));
  },
  createHash: (algorithm: string) => {
    return cryptoBrowserify.createHash(algorithm);
  },
  createHmac: (algorithm: string, key: Buffer | string) => {
    return cryptoBrowserify.createHmac(algorithm, key);
  }
};

// Named exports for direct importing
export const randomBytes = thorCrypto.randomBytes;
export const createHash = thorCrypto.createHash;
export const createHmac = thorCrypto.createHmac;

// Default export for require() style imports
export default thorCrypto;