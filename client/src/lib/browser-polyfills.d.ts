/**
 * Type declarations for browser polyfill modules
 * This allows TypeScript to recognize these modules without requiring @types packages
 */

declare module 'path-browserify';
declare module 'browserify-zlib';
declare module 'stream-browserify';
declare module 'stream-http';
declare module 'https-browserify';
declare module 'os-browserify/browser';
declare module 'os-browserify';
declare module 'events';
declare module 'url';
declare module 'assert';
declare module 'util';
declare module 'crypto-browserify';
declare module 'buffer';
declare module 'process/browser';
declare module 'elliptic';
declare module 'secp256k1';

// Extend Window interface to include our polyfill properties
interface Window {
  Buffer: typeof Buffer;
  global: typeof globalThis;
  process: any;
  crypto: any; // Browser's built-in crypto
  cryptoPolyfill: any; // Our Node.js crypto polyfill
  thorCrypto: any; // Thor-specific crypto polyfills
  stream: any;
  http: any;
  https: any;
  os: any;
  path: any;
  events: any;
  url: any;
  assert: any;
  zlib: any;
  util: any;
}

// Add missing properties to Process and NodeJS.Process
declare global {
  interface Process {
    browser?: boolean;
  }
  
  namespace NodeJS {
    interface Process {
      browser?: boolean;
    }
  }
  
  interface Window {
    thorCrypto: any;
    cryptoPolyfill: any;
    Buffer: any;
    process: Process;
    global: typeof globalThis;
    stream: any;
    http: any;
    https: any;
    os: any;
    path: any;
    events: any;
    url: any;
    assert: any;
    zlib: any;
    util: any;
  }
}