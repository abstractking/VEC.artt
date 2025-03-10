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
declare module 'events';
declare module 'url';
declare module 'assert';
declare module 'util';

// Extend Window interface to include our polyfill properties
interface Window {
  Buffer: typeof Buffer;
  global: typeof globalThis;
  process: typeof process;
  crypto: any; // Browser's built-in crypto
  cryptoPolyfill: any; // Our Node.js crypto polyfill
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