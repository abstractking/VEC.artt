/**
 * Explicit process polyfill
 * This is needed because Vite treats 'process' as an external module
 */

// Import the actual process module
import processPolyfill from 'process';

// Directly assign to window and global
// The browser won't have process defined, so we need to do this explicitly
window.process = processPolyfill;

// Ensure we have global defined first
window.global = window.global || window;
global = window;

// Make process available on global too
global.process = window.process;

// Add essential ENV variables that might be needed
// This supplements the default 'env' object
if (!window.process.env) {
  window.process.env = {};
}

// Ensure browser flag is set
window.process.browser = true;

console.log("Process polyfill explicitly initialized");