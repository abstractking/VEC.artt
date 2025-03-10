/**
 * Polyfills for thor-devkit Node.js dependencies
 * This file provides browser-compatible implementations of Node.js crypto functions
 */

import cryptoBrowserify from 'crypto-browserify';

// Create a namespace that matches the Node.js crypto module interface
const thorCrypto = {
  // Implement the specific functions needed by thor-devkit
  randomBytes: (size: number): Buffer => {
    return cryptoBrowserify.randomBytes(size);
  },
  
  createHash: (algorithm: string) => {
    return cryptoBrowserify.createHash(algorithm);
  },
  
  createHmac: (algorithm: string, key: Buffer | string) => {
    return cryptoBrowserify.createHmac(algorithm, key);
  }
};

// Export the namespace as the default export
export default thorCrypto;

// Also export individual functions to match Node.js crypto module interface
export const randomBytes = thorCrypto.randomBytes;
export const createHash = thorCrypto.createHash;
export const createHmac = thorCrypto.createHmac;