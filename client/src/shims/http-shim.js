/**
 * HTTP shim for browser environments
 * This provides compatibility interfaces for code expecting Node's HTTP module
 */

// Stub Agent class for compatibility
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

// Export default module interface
export default {
  Agent,
  request: () => {
    throw new Error('http.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('http.get is not supported in browser environments');
  }
};