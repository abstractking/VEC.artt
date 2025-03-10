/**
 * Explicit Buffer polyfill
 * This is needed because Vite treats 'buffer' as an external module
 */

// Import the actual Buffer module
import { Buffer as BufferPolyfill } from 'buffer';

// Directly assign to window and global
window.Buffer = BufferPolyfill;

// Ensure we have global defined first
window.global = window.global || window;
global = window;

// Make Buffer available on global too
global.Buffer = BufferPolyfill;

console.log("Buffer polyfill explicitly initialized");