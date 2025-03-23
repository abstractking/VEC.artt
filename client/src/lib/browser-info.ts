/**
 * Browser environment detection and configuration
 * This module helps with runtime environment detection and configuration
 */

// Basic environment checks
export const isBrowser = typeof window !== 'undefined';
export const isNode = typeof process !== 'undefined' && 
  typeof process.versions !== 'undefined' && 
  typeof process.versions.node !== 'undefined';

// More specific environment checks
export const isTest = process.env.NODE_ENV === 'test';
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

// VeChain network detection
export const isTestNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'test';
export const isMainNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main';

// Feature detection
export const hasWebSocket = typeof WebSocket !== 'undefined';
export const hasCrypto = typeof window !== 'undefined' && !!window.crypto;
export const hasIndexedDB = typeof window !== 'undefined' && !!window.indexedDB;

// Add browser flag to process object if we're in a browser
if (typeof process !== 'undefined' && typeof window !== 'undefined') {
  (process as any).browser = true;
}

// Helper to detect if we have necessary crypto capabilities
export function checkCryptoSupport() {
  if (!hasCrypto) {
    console.warn('Web Crypto API not available');
    return false;
  }
  
  // Check for specific methods we need
  const cryptoFeatures = {
    getRandomValues: typeof window.crypto.getRandomValues === 'function',
    subtle: typeof window.crypto.subtle === 'object',
  };
  
  return cryptoFeatures;
}

// Export the environment info as a single object
export default {
  isBrowser,
  isNode,
  isTest,
  isDev,
  isProd,
  isTestNet,
  isMainNet,
  hasWebSocket,
  hasCrypto,
  hasIndexedDB,
  checkCryptoSupport
};