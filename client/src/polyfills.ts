/**
 * Node.js Polyfills for VeChain DApp Kit
 * 
 * This file provides necessary polyfills for the browser environment
 * to support VeChain DApp Kit and Connex functionality.
 */

// Global polyfill for browser environment
(window as any).global = window;

// Buffer polyfill
if (!(window as any).Buffer) {
  try {
    (window as any).Buffer = (window as any).Buffer || require('buffer').Buffer;
  } catch (e) {
    console.warn('Failed to polyfill Buffer:', e);
  }
}

// Process polyfill
(window as any).process = (window as any).process || {
  env: { DEBUG: undefined },
  version: '', // to avoid undefined.slice error in some libraries
  nextTick: (fn: Function) => setTimeout(fn, 0)
};

// Stream polyfills
try {
  (window as any).stream = (window as any).stream || require('stream-browserify');
} catch (e) {
  console.warn('Failed to polyfill stream:', e);
}

// Critical polyfills for crypto operations
try {
  if (!(window as any).crypto) {
    console.warn('Crypto API not available, trying to polyfill');
    // Basic polyfill - this is not secure for production use
    (window as any).crypto = {
      getRandomValues: function(buffer: Uint8Array) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = Math.floor(Math.random() * 256);
        }
        return buffer;
      }
    };
  }
} catch (e) {
  console.warn('Failed to polyfill crypto:', e);
}

// Log successful initialization
console.log('Critical polyfills initialized via inline script');