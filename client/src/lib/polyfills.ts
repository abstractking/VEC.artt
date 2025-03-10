/**
 * Main polyfill file for browser compatibility
 * This ensures all Node.js modules are properly polyfilled in the browser
 */

// Make Buffer available globally
import { Buffer } from 'buffer';
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
}

// Make process available globally
import process from 'process';
if (typeof window !== 'undefined') {
  window.process = window.process || process;
}

// Make sure global is defined
if (typeof window !== 'undefined') {
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
if (typeof window !== 'undefined') {
  // Native browser crypto is preserved
  window.cryptoPolyfill = crypto;
  
  // Add Node.js-compatible modules to window
  window.stream = window.stream || stream;
  window.http = window.http || http;
  window.https = window.https || https;
  window.path = window.path || path;
  window.os = window.os || os;
  window.events = window.events || events;
  window.url = window.url || url;
  window.assert = window.assert || assert;
  window.zlib = window.zlib || zlib;
  window.util = window.util || util;
}

// Set up thor-specific polyfills
import * as thorPolyfills from './thor-polyfills';
if (typeof window !== 'undefined') {
  window.thorCrypto = thorPolyfills;
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