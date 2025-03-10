/**
 * This script must run before any imports to define global variables needed for Node.js compatibility
 * This ensures critical objects like global, process, and Buffer are available before any module loads
 */

// GLOBAL OBJECT
// Define global object synchronously before any modules load
window.global = window;

// Explicitly make global available in the global scope as well
global = window;

// PROCESS OBJECT
// Define a basic process object that won't break code before the real polyfill loads
if (!window.process) {
  window.process = {
    env: {},
    nextTick: function(cb) { setTimeout(cb, 0); },
    browser: true,
    version: '',
    versions: {},
    platform: 'browser'
  };
  
  // Make process available on global as well
  global.process = window.process;
}

// BUFFER PLACEHOLDER
// Create minimal Buffer implementations that won't break code before the real polyfill loads
if (!window.Buffer) {
  window.Buffer = {
    from: function() { return []; },
    isBuffer: function() { return false; },
    alloc: function() { return []; }
  };
  
  // Make Buffer available on global as well
  global.Buffer = window.Buffer;
}

// Log success for debugging
console.log("Early polyfills initialized (global, process, Buffer)");

// Add essential utilities that might be needed by modules during initialization
window.setTimeout = window.setTimeout || function(fn) { fn(); };
window.setImmediate = window.setImmediate || function(fn) { setTimeout(fn, 0); };
global.setTimeout = window.setTimeout;
global.setImmediate = window.setImmediate;