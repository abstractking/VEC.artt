/**
 * This script gets injected directly into the HTML before any modules load
 * It provides minimal polyfills needed for initialization
 */

// Ensure crypto is available early
if (typeof window !== 'undefined' && !window.crypto) {
  window.crypto = {
    getRandomValues: function(buffer) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] = Math.floor(Math.random() * 256);
      }
      return buffer;
    }
  };
}

// Ensure Buffer is available early
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = {
    from: function(data) {
      if (typeof data === 'string') {
        return new TextEncoder().encode(data);
      }
      return new Uint8Array(data);
    },
    isBuffer: function() { return false; }
  };
}

// Minimal global needed for some libraries
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Log that polyfills are initialized
console.log('Critical polyfills initialized via inline script');