// Polyfills for browser environment
import { Buffer } from 'buffer';

// Make sure TypeScript knows about our global augmentations
declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
  }
}

// Make Buffer available globally 
window.Buffer = Buffer;

// Add global for compatibility with Node.js modules
window.global = window;

// Log that polyfills are loaded
console.log("Polyfills loaded: Buffer is now available in the browser environment");

// Add any other Node.js specific polyfills here