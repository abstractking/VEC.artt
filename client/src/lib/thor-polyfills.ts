/**
 * Thor-specific polyfills for crypto functions
 */
import * as cryptoBrowserify from 'crypto-browserify';

// Create a custom implementation of Node's crypto module
const thorCrypto = {
  // Implement the exact functions used by thor-devkit
  randomBytes: (size: number) => {
    return Buffer.from(cryptoBrowserify.randomBytes(size));
  },
  createHash: (algorithm: string) => {
    return cryptoBrowserify.createHash(algorithm);
  },
  createHmac: (algorithm: string, key: Buffer | string) => {
    return cryptoBrowserify.createHmac(algorithm, key);
  },
  // Add other crypto functions used by thor-devkit
  pbkdf2: (password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number, digest: string, callback: Function) => {
    return cryptoBrowserify.pbkdf2(password, salt, iterations, keylen, digest, callback);
  },
  pbkdf2Sync: (password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number, digest: string) => {
    return cryptoBrowserify.pbkdf2Sync(password, salt, iterations, keylen, digest);
  }
};

// Named exports
export const randomBytes = thorCrypto.randomBytes;
export const createHash = thorCrypto.createHash;
export const createHmac = thorCrypto.createHmac;
export const pbkdf2 = thorCrypto.pbkdf2;
export const pbkdf2Sync = thorCrypto.pbkdf2Sync;

// Default export
export default thorCrypto;

// If we're in a browser environment, add our functions to the existing thorCrypto object
// This avoids trying to set window.thorCrypto directly which could cause problems
if (typeof window !== 'undefined' && window.thorCrypto) {
  Object.assign(window.thorCrypto, thorCrypto);
}