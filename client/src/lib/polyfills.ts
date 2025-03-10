/**
 * Polyfills for browser environment
 * This file provides essential Node.js compatibility in the browser
 * It must be imported before any other modules that might depend on these globals
 */

// First ensure global is defined everywhere needed
// This is intentionally repeated in multiple locations for maximum compatibility
if (typeof window !== 'undefined') {
  // Set window.global first
  // @ts-ignore
  window.global = window;
  
  // Also set global in global scope directly
  // @ts-ignore
  if (typeof global === 'undefined') {
    // @ts-ignore
    globalThis.global = window;
  }
}

// Import all required polyfills
import { Buffer } from 'buffer';

// In case process is not already set by our explicit polyfill
// This is a fallback that should rarely be needed
import processJs from 'process';
const processObj = window.process || processJs;
if (!window.process) window.process = processObj;

// Import remaining polyfills
import cryptoBrowserify from 'crypto-browserify';
import streamBrowserify from 'stream-browserify';
import streamHttp from 'stream-http';
import httpsBrowserify from 'https-browserify';
import osBrowserify from 'os-browserify';
import assert from 'assert';

// Make sure TypeScript knows about our global augmentations
declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
    process: typeof process;
    crypto: any; // Use any type for crypto to avoid type conflicts
    stream: any;
    http: any;
    https: any;
    os: any;
    assert: typeof assert;
  }
}

if (typeof window !== 'undefined') {
  // Make Buffer available globally and on global object too 
  window.Buffer = Buffer;
  
  // Verify the global object is properly set with multiple safety checks
  // This is critical for libraries that check for the existence of global
  window.global = window.global || window;
  
  // Extra insurance - set global in global scope too
  try {
    // @ts-ignore - global might not be defined in TypeScript but we're polyfilling it
    global = global || window;
  } catch (e) {
    try {
      // @ts-ignore
      globalThis.global = window;
    } catch (e2) {
      console.warn("Could not set global in global scope", e2);
    }
  }
  
  // Add Node.js polyfills - ensure we use our already initialized process object
  window.process = window.process || processObj;
  
  // For crypto, preserve the native browser crypto object and extend it
  window.crypto = window.crypto || {};
  // Add Node.js crypto methods to the browser's crypto object
  Object.keys(cryptoBrowserify).forEach(key => {
    if (!window.crypto[key]) {
      window.crypto[key] = cryptoBrowserify[key];
    }
  });
  
  // Explicitly set randomBytes as it's commonly used
  if (!window.crypto.randomBytes && cryptoBrowserify.randomBytes) {
    window.crypto.randomBytes = cryptoBrowserify.randomBytes;
  }
  
  // Add remaining polyfills
  window.stream = streamBrowserify;
  window.http = streamHttp;
  window.https = httpsBrowserify;
  window.os = osBrowserify;
  window.assert = assert;
  
  // Make Buffer available on the global object too
  try {
    // @ts-ignore
    global.Buffer = Buffer;
  } catch (e) {
    console.warn("Could not set Buffer on global object", e);
  }
  
  // Log successful polyfill loading
  console.log("Node.js polyfills loaded: global, crypto, Buffer, process, etc. are now available");
}