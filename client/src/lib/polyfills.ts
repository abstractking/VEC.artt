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
  
  // Define non-configurable property to prevent modifications
  Object.defineProperty(window, 'cryptoPolyfill', {
    value: cryptoPolyfill,
    writable: false,
    configurable: false
  });
  
  // Add Node.js-compatible modules to window safely
  const moduleMapping: Record<string, unknown> = {
    stream,
    http,
    https,
    path,
    os,
    events,
    url,
    assert,
    zlib,
    util
  };
  
  // Safely assign modules to window
  Object.entries(moduleMapping).forEach(([key, value]) => {
    if (!(key in window)) {
      Object.defineProperty(window, key as keyof Window, {
        value,
        writable: false,
        configurable: false
      });
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