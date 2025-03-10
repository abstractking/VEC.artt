/**
 * Explicitly provide browser-compatible versions of Node.js modules
 * that get externalized during the Vite build process.
 * 
 * This file is specifically designed to solve the Netlify build issue
 * where thor-devkit tries to import { randomBytes } from 'crypto'.
 */

// Import browserify versions
import cryptoBrowserify from 'crypto-browserify';
import streamBrowserify from 'stream-browserify';
import httpBrowserify from 'stream-http';
import httpsBrowserify from 'https-browserify';
import bufferBrowserify from 'buffer';
import osBrowserify from 'os-browserify/browser';
import assertBrowserify from 'assert';
import eventsBrowserify from 'events';
import utilBrowserify from 'util';
import urlBrowserify from 'url/';

// Create global externals object if it doesn't exist
if (typeof window !== 'undefined') {
  window.__vite_browser_external = window.__vite_browser_external || {};
  
  // Add Thor DevKit's required crypto functions
  window.__vite_browser_external.randomBytes = cryptoBrowserify.randomBytes;
  window.__vite_browser_external.createHash = cryptoBrowserify.createHash;
  window.__vite_browser_external.createHmac = cryptoBrowserify.createHmac;
  window.__vite_browser_external.pbkdf2 = cryptoBrowserify.pbkdf2;
  window.__vite_browser_external.pbkdf2Sync = cryptoBrowserify.pbkdf2Sync;
  
  // Provide complete crypto functionality
  window.__vite_browser_external.crypto = cryptoBrowserify;
  
  // Provide other required Node.js modules
  window.__vite_browser_external.Buffer = bufferBrowserify.Buffer;
  window.__vite_browser_external.stream = streamBrowserify;
  window.__vite_browser_external.http = httpBrowserify;
  window.__vite_browser_external.https = httpsBrowserify;
  window.__vite_browser_external.os = osBrowserify;
  window.__vite_browser_external.assert = assertBrowserify;
  window.__vite_browser_external.events = eventsBrowserify;
  window.__vite_browser_external.util = utilBrowserify;
  window.__vite_browser_external.url = urlBrowserify;
  
  console.log("Browserify externals initialized for compatibility with Vite build process");
}

// Export these so they can be imported directly
export const randomBytes = cryptoBrowserify.randomBytes;
export const createHash = cryptoBrowserify.createHash;
export const createHmac = cryptoBrowserify.createHmac;
export const pbkdf2 = cryptoBrowserify.pbkdf2;
export const pbkdf2Sync = cryptoBrowserify.pbkdf2Sync;

export default cryptoBrowserify;