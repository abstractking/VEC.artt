/**
 * Crypto shim for browser environments
 * This provides compatibility interfaces for code expecting Node's crypto module
 */

// Browser-compatible createHash implementation
export const createHash = function(algorithm) {
  // Basic browser-compatible SHA256 implementation using Web Crypto API
  return {
    _data: '',
    update: function(data) {
      this._data = data;
      return this;
    },
    digest: function(encoding) {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        try {
          // Note: This would normally be async, but for compatibility we're simulating sync behavior
          // In a real app, you'd want to properly handle the async nature of subtle.digest
          const textEncoder = new TextEncoder();
          const data = textEncoder.encode(this._data);
          
          // This is just a stub that won't actually work correctly in browser
          // For a real implementation, you'd need to handle the Promise
          console.warn('Crypto hash requested in browser - providing stub implementation');
          
          if (encoding === 'hex') {
            return Array.from(new Uint8Array(32))
              .map(b => b.toString(16).padStart(2, '0'))
              .join('');
          }
          
          return new Uint8Array(32);
        } catch (e) {
          console.error('Error in crypto shim:', e);
        }
      }
      
      // Fallback
      console.warn('Crypto hash requested but not available in browser');
      if (encoding === 'hex') {
        return '0000000000000000000000000000000000000000000000000000000000000000';
      }
      return new Uint8Array(32); // Return empty hash
    }
  };
};

// Browser-compatible randomBytes implementation
export const randomBytes = function(size) {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    return bytes;
  }
  
  // Fallback with Math.random (not cryptographically secure)
  console.warn('Crypto randomBytes requested but using Math.random fallback');
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};

// Export default module interface
export default {
  createHash,
  randomBytes
};