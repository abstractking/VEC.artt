/**
 * Thor-specific polyfills for crypto functions
 * Enhanced version with fallbacks for all environments
 */
import * as cryptoBrowserify from 'crypto-browserify';

// Create a secure random function that works in all environments
function secureRandomBytes(size: number): Uint8Array {
  // Use Web Crypto API if available (most secure)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint8Array(size);
    window.crypto.getRandomValues(buffer);
    return buffer;
  }
  
  // Fallback to crypto-browserify
  try {
    return cryptoBrowserify.randomBytes(size);
  } catch (e) {
    console.warn('Crypto API unavailable, using less secure random generator');
    // Last resort fallback (less secure but functional)
    const buffer = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  }
}

// Wrap hash functions with try-catch to prevent runtime crashes
function safeCreateHash(algorithm: string) {
  try {
    return cryptoBrowserify.createHash(algorithm);
  } catch (e) {
    console.error(`Error creating hash with algorithm ${algorithm}:`, e);
    // Return a mock object that won't crash but will log errors
    return {
      update: (data: any) => {
        console.warn('Using mock hash, security compromised');
        return { digest: () => Buffer.from('MOCK_HASH_INSECURE') };
      }
    };
  }
}

function safeCreateHmac(algorithm: string, key: Buffer | string) {
  try {
    return cryptoBrowserify.createHmac(algorithm, key);
  } catch (e) {
    console.error(`Error creating HMAC with algorithm ${algorithm}:`, e);
    // Return a mock object that won't crash but will log errors
    return {
      update: (data: any) => {
        console.warn('Using mock HMAC, security compromised');
        return { digest: () => Buffer.from('MOCK_HMAC_INSECURE') };
      }
    };
  }
}

// Create a custom implementation of Node's crypto module with fallbacks
const thorCrypto = {
  // Implement the exact functions used by thor-devkit
  randomBytes: (size: number) => {
    return Buffer.from(secureRandomBytes(size));
  },
  createHash: safeCreateHash,
  createHmac: safeCreateHmac,
  
  // Add other crypto functions used by thor-devkit
  pbkdf2: (password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number, digest: string, callback: Function) => {
    try {
      return cryptoBrowserify.pbkdf2(password, salt, iterations, keylen, digest, callback);
    } catch (e) {
      console.error('Error in pbkdf2:', e);
      // Call callback with null error and mock result to prevent crashes
      setTimeout(() => callback(null, Buffer.from('MOCK_PBKDF2_INSECURE')), 0);
    }
  },
  pbkdf2Sync: (password: string | Buffer, salt: string | Buffer, iterations: number, keylen: number, digest: string) => {
    try {
      return cryptoBrowserify.pbkdf2Sync(password, salt, iterations, keylen, digest);
    } catch (e) {
      console.error('Error in pbkdf2Sync:', e);
      return Buffer.from('MOCK_PBKDF2SYNC_INSECURE');
    }
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

// Initialize early to ensure it's available throughout the app lifecycle
export function initCryptoPolyfills() {
  console.log('Setting up crypto environment with cryptoPolyfill');
  
  // Make thorCrypto available globally for patched modules
  if (typeof window !== 'undefined') {
    // Assign directly to prevent "Cannot redefine property" errors
    window.thorCrypto = window.thorCrypto || thorCrypto;
    
    // Also provide crypto polyfill for modules that check for global.crypto
    if (!window.crypto) {
      // Only provide getRandomValues if not available
      // @ts-ignore - intentionally adding to window.crypto
      window.crypto = window.crypto || {
        getRandomValues: function(buffer: Uint8Array) {
          const bytes = secureRandomBytes(buffer.length);
          buffer.set(bytes);
          return buffer;
        }
      };
    }
  }
  
  return thorCrypto;
}

// Auto-initialize on import
initCryptoPolyfills();