/**
 * Build-specific polyfills for Node.js modules
 * This file is used during the Netlify build process
 */

// These imports ensure Vite bundles the polyfills
import * as buffer from 'buffer';
import * as process from 'process';
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

// Make sure global Buffer is available
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || buffer.Buffer;
  window.process = window.process || process;
  
  // Set up global objects
  window.global = window.global || window;
  
  // Make Node.js modules available through window
  window.crypto = window.crypto || crypto;
  window.stream = stream;
  window.http = http;
  window.https = https;
  window.path = path;
  window.os = os;
  window.events = events;
  window.url = url;
  window.assert = assert;
  window.zlib = zlib;
  window.util = util;
}

// Export these modules for use elsewhere
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
  util
};