/**
 * Browser polyfills for VeChain compatibility on Vercel
 * This file gets imported early in the app's lifecycle to ensure critical polyfills are available
 */

// Ensure global i1s defined
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Ensure process is defined with environment variables
if (typeof window !== 'undefined' && !window.process) {
  window.process = { 
    env: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      VITE_VECHAIN_NETWORK: process.env.VITE_VECHAIN_NETWORK,
      VITE_VECHAIN_NODE_URL_TESTNET: process.env.VITE_VECHAIN_NODE_URL_TESTNET,
      VITE_VECHAIN_NODE_URL_MAINNET: process.env.VITE_VECHAIN_NODE_URL_MAINNET,
      VITE_VECHAIN_TESTNET_GENESIS_ID: process.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
      VITE_VECHAIN_MAINNET_GENESIS_ID: process.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
      VITE_DEPLOYMENT_ENV: process.env.VITE_DEPLOYMENT_ENV
    }, 
    browser: true,
    nextTick: (cb) => setTimeout(cb, 0)
  };
}

// Ensure Buffer is available
if (typeof window !== 'undefined' && !window.Buffer) {
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
  
  window.Buffer = Buffer;
}

// Ensure crypto is available
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

// Fix for module exports
if (typeof window !== 'undefined') {
  window.module = window.module || {};
  window.module.exports = window.module.exports || {};
  window.exports = window.exports || {};
}

console.log('Critical polyfills initialized via Vercel inline script');