/**
 * Browser polyfills for VeChain compatibility on Vercel
 * This file gets imported early in the app's lifecycle to ensure critical polyfills are available
 */

// Ensure global is defined
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Ensure process is defined with environment variables
if (typeof window !== 'undefined') {
  // Create or update process.env with environment variables
  window.process = window.process || {};
  window.process.env = window.process.env || {};
  
  // Explicitly define critical environment variables for VeChain
  const envVars = {
    NODE_ENV: 'production',
    VITE_VECHAIN_NETWORK: 'test',
    VITE_VECHAIN_NODE_URL_TESTNET: 'https://testnet.veblocks.net',
    VITE_VECHAIN_NODE_URL_MAINNET: 'https://mainnet.veblocks.net',
    VITE_VECHAIN_TESTNET_GENESIS_ID: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    VITE_VECHAIN_MAINNET_GENESIS_ID: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
    VITE_DEPLOYMENT_ENV: 'vercel'
  };
  
  // Merge with existing values, preferring existing values if present
  Object.keys(envVars).forEach(key => {
    if (!(key in window.process.env) || !window.process.env[key]) {
      window.process.env[key] = envVars[key];
    }
  });
  
  // Add process properties
  window.process.browser = true;
  window.process.nextTick = window.process.nextTick || ((cb) => setTimeout(cb, 0));
  
  // For debugging
  console.log('Vercel environment variables set:', window.process.env.VITE_VECHAIN_NETWORK);
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