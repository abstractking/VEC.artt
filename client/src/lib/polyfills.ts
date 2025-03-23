/**
 * Unified polyfill system for browser compatibility
 * 
 * This file serves as the central polyfill manager, reducing redundancy and potential conflicts
 * by coordinating all polyfill setup in one place.
 */

import { isBrowser } from './browser-info';

// Core polyfills
import { Buffer } from 'buffer';
import process from 'process';
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

// VeChain specific polyfills
import * as thorPolyfills from './thor-polyfills';
import * as secp256k1Browser from './secp256k1-browser';

// Only run in browser environment
if (isBrowser) {
  console.log("Setting up unified polyfill system...");
  
  // Set up global object/context
  window.global = window.global || window;
  
  // Set up core polyfills
  window.Buffer = window.Buffer || Buffer;
  window.process = window.process || process;
  
  // Configure crypto carefully - don't override native crypto
  if (!window.cryptoPolyfill) {
    const cryptoPolyfill = Object.create(null);
    Object.assign(cryptoPolyfill, crypto);
    window.cryptoPolyfill = cryptoPolyfill;
  }
  
  // Create a safer stream implementation with null checks
  const safeStream = {
    ...stream,
    Transform: stream.Transform || null,
    Readable: stream.Readable || null,
    Writable: stream.Writable || null,
    Duplex: stream.Duplex || null,
  };
  
  // Create a safer util implementation for browser compatibility
  const safeUtil = {
    ...util,
    debuglog: () => () => {}, // Stub implementation
    inspect: (obj: any) => JSON.stringify(obj, null, 2), // Simple inspect implementation
  };
  
  // Set up thor-specific crypto polyfills
  if (!window.thorCrypto) {
    window.thorCrypto = Object.create(null);
  }
  
  // Merge thor polyfills with existing object
  Object.assign(window.thorCrypto, thorPolyfills);
  
  // Set up secp256k1 browser compatibility
  if (typeof (window as any).secp256k1 === 'undefined') {
    (window as any).secp256k1 = secp256k1Browser;
  }
  
  // Map Node.js modules to window properties safely
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
  
  // Safely assign Node.js modules to window properties
  Object.entries(moduleMapping).forEach(([key, value]) => {
    try {
      if (!(key in window)) {
        (window as any)[key] = value;
      }
    } catch (e) {
      console.warn(`Could not assign ${key} to window:`, e);
    }
  });
  
  console.log("Unified polyfill system initialized successfully");
}

// Export all modules for TypeScript compatibility and direct imports
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
  thorPolyfills,
  secp256k1Browser
};