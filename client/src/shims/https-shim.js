/**
 * HTTPS shim for browser environments
 * This provides compatibility interfaces for code expecting Node's HTTPS module
 */

// Stub Agent class that caused issues in Vercel build
export class Agent {
  constructor() {
    // Minimal implementation
  }
}

// Export default module interface
export default {
  Agent,
  request: () => {
    throw new Error('https.request is not supported in browser environments');
  },
  get: () => {
    throw new Error('https.get is not supported in browser environments');
  }
};