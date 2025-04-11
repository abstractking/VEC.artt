/**
 * This file initializes crypto polyfills before any other imports
 * to ensure compatibility with VeChain libraries in all environments.
 * 
 * CRITICAL FOR NETLIFY DEPLOYMENT:
 * This file must be imported first in main.tsx to ensure that crypto
 * functions are available before any VeChain-related code executes.
 * Do not remove or alter this file's import order.
 */

// Import and initialize the crypto polyfills first
import { initCryptoPolyfills } from './lib/thor-polyfills';

// This must be executed before any other imports that might use crypto
console.log('Critical polyfills initialized via inline script');
const cryptoEnv = initCryptoPolyfills();

// Export for potential use elsewhere
export default cryptoEnv;