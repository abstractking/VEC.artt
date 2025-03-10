/**
 * Build-specific polyfills for Node.js modules
 * This file is used during the Netlify build process
 */

import { Buffer } from 'buffer';
import crypto from 'crypto-browserify';
import stream from 'stream-browserify';
import http from 'stream-http';
import https from 'https-browserify';
import url from 'url';
import assert from 'assert';
import events from 'events';
import os from 'os-browserify/browser';

// Make sure Buffer is available globally
if (typeof window !== 'undefined') {
  (window as any).Buffer = Buffer;
}

// Create a namespace for externalized modules
const externalModules = {
  crypto,
  stream,
  http,
  https,
  url,
  assert,
  events,
  os,
  Buffer
};

// Export individual modules
export { crypto, stream, http, https, url, assert, events, os, Buffer };

// Default export all modules
export default externalModules;