/**
 * Vercel-specific polyfills for critical browser APIs
 * This file is injected into the HTML by the Vite plugin in vite.config.vercel.js
 */

// Ensure window and global are defined and correctly set up
if (typeof window !== 'undefined') {
  // Set up global for modules that expect it
  window.global = window;
  
  // Set up Buffer polyfill if not already present
  if (!window.Buffer) {
    const textEncoder = new TextEncoder();
    const textDecoder = new TextDecoder();
    
    class Buffer {
      static from(data, encoding) {
        if (typeof data === 'string') {
          return textEncoder.encode(data);
        }
        if (data instanceof Uint8Array) {
          return data;
        }
        return new Uint8Array(data);
      }
      
      static isBuffer(obj) { 
        return obj instanceof Uint8Array; 
      }
      
      static alloc(size) {
        return new Uint8Array(size);
      }
      
      static concat(list, length) {
        if (length === undefined) {
          length = list.reduce((acc, val) => acc + val.length, 0);
        }
        
        const result = new Uint8Array(length);
        let offset = 0;
        
        for (const buf of list) {
          result.set(buf, offset);
          offset += buf.length;
        }
        
        return result;
      }
    }
    
    // Set Buffer to window directly to ensure it's available early
    window.Buffer = Buffer;
  }
  
  // Ensure crypto API is available
  if (!window.crypto) {
    window.crypto = {
      getRandomValues: function(buffer) {
        for (let i = 0; i < buffer.length; i++) {
          buffer[i] = Math.floor(Math.random() * 256);
        }
        return buffer;
      }
    };
  }
  
  // Ensure process is defined
  if (!window.process) {
    window.process = {
      env: {},
      nextTick: (fn) => setTimeout(fn, 0),
      browser: true,
      version: ''
    };
  }
  
  // Fix for module exports in some environments
  window.module = window.module || {};
  window.module.exports = window.module.exports || {};
  window.exports = window.exports || {};
}

console.log('Critical polyfills initialized via Vercel inline script');