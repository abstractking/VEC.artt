/**
 * Main polyfill file for browser compatibility
 * This ensures all Node.js modules are properly polyfilled in the browser
 */

import { isBrowser } from './browser-info';

// Make Buffer available globally
import { Buffer } from 'buffer';
if (isBrowser) {
  window.Buffer = window.Buffer || Buffer;
}

// Make process available globally
import process from 'process';
if (isBrowser) {
  window.process = window.process || process;
}

// Make sure global is defined
if (isBrowser) {
  window.global = window.global || window;
}

// Import and expose browserify modules
import * as buffer from 'buffer';
import * as crypto from 'crypto-browserify';
import * as stream from 'stream-browserify';
import * as http from 'stream-http';
import * as https from 'https-browserify';
import * as path from 'path-browserify';
import * as os from 'os-browserify/browser';
import * as events from 'events';
import * as url from 'url';
import * as assert from 'assert';
import * as zlib from 'browserify-zlib';
import * as util from 'util';

// Make modules available through window
if (isBrowser) {
  // Create a new object to hold our crypto implementation
  const cryptoPolyfill = Object.create(null);
  Object.assign(cryptoPolyfill, crypto);
  
  // Make crypto browserify available without trying to redefine the native crypto
  window.cryptoPolyfill = cryptoPolyfill;
  
  // Create a safe util implementation
  const safeUtil = {
    ...util,
    debuglog: () => () => {}, // Stub implementation
    inspect: (obj: any) => JSON.stringify(obj, null, 2), // Simple inspect implementation
  };
  
  // Create a safe stream implementation
  const safeStream = {
    ...stream,
    Transform: stream.Transform || null,
    Readable: stream.Readable || null,
    Writable: stream.Writable || null,
    Duplex: stream.Duplex || null,
  };
  
  // Add Node.js-compatible modules to window safely
  const moduleMapping: Record<string, unknown> = {
    stream: safeStream,
    http,
    https,
    path,
    os,
    events,
    url,
    assert,
    zlib,
    util: safeUtil
  };
  
  // Safely assign modules to window
  Object.entries(moduleMapping).forEach(([key, value]) => {
    try {
      // Using type assertion for TypeScript compatibility
      if (!(key in window)) {
        (window as any)[key] = value;
      }
    } catch (e) {
      console.warn(`Could not assign ${key} to window:`, e);
    }
  });
}

// Set up thor-specific polyfills
import * as thorPolyfills from './thor-polyfills';
if (isBrowser && window.thorCrypto) {
  // Merge thor polyfills with existing object instead of overwriting
  Object.assign(window.thorCrypto, thorPolyfills);
}

// Export modules for TypeScript compatibility
export {
  buffer,
  process,
  crypto,
  stream,
  http,
  https,
  path,
  os,
  events,
  url,
  assert,
  zlib,
  util,
  thorPolyfills
};