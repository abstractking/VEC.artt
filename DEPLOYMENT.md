# VeCollab Marketplace Deployment Guide

This document provides instructions and explains the process for deploying the VeCollab marketplace to Netlify.

## Deployment Overview

The VeCollab marketplace uses Netlify for deployment with automated builds from the GitHub repository. This guide covers the necessary steps and configuration to ensure successful deployment with proper blockchain integration.

## Prerequisites

- GitHub repository connected to Netlify
- Node.js v20.x
- VeChain TestNet or MainNet connection details
- VeChain private key for wallet connection (only for TestNet in dev environments)

## Environment Variables

The following environment variables should be set in the Netlify dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_REACT_APP_VECHAIN_NETWORK` | VeChain network (test or main) | `test` |
| `VITE_REACT_APP_NFT_CONTRACT_ADDRESS` | VeChain NFT contract address | `0x89e658faa1e1861b7923f35f62c96fb8e07c80b2` |
| `VITE_VECHAIN_PRIVATE_KEY` | Private key for TestNet wallet connection (dev only) | *secure private key* |
| `NODE_VERSION` | Node.js version | `20` |
| `NODE_ENV` | Environment (production or development) | `production` |

## Build Process

The build process for Netlify is configured in `netlify.toml` and involves the following steps:

1. Install dependencies with `npm ci`
2. Run patching scripts to handle browser compatibility:
   - `scripts/patch-thor-devkit-improved.cjs` - Patches thor-devkit for browser compatibility
   - `scripts/patch-vechain-module.cjs` - Creates necessary browser polyfills
3. Build the application with `npm run build`

## Browser Compatibility

The VeChain libraries (thor-devkit and @vechain/connex-driver) are primarily designed for Node.js environments and use several Node.js core modules like `crypto`, `stream`, and others. For browser compatibility, we use several strategies:

### 1. Polyfills

Several polyfill files are created and imported in specific order in `client/src/main.tsx`:

- `globalPolyfill.js` - Sets window.global = window
- `processPolyfill.js` - Polyfills Node.js process
- `bufferPolyfill.js` - Polyfills Node.js Buffer
- `streamPolyfill.js` - Polyfills Node.js stream
- `lib/build-polyfills.ts` - Imports all necessary browserify modules
- `lib/thor-polyfills.ts` - Provides crypto implementations for thor-devkit
- `lib/secp256k1-browser.js` - Browser-compatible secp256k1 implementation

### 2. Patching Scripts

Two patching scripts modify the Node.js modules for browser compatibility:

#### a. patch-thor-devkit-improved.cjs

This script:
- Scans thor-devkit and @vechain/connex-driver packages
- Replaces Node.js module imports with browser-compatible versions
- Handles special cases for crypto and secp256k1

#### b. patch-vechain-module.cjs

This script:
- Creates polyfill files in client/src/lib/
- Sets up re-exports for Node.js core modules
- Provides browser-compatible implementations

## Troubleshooting

### Common Build Issues

1. **Path Resolution Problems**

   If you see errors like "Could not resolve '../client/src/lib/thor-polyfills'", the patching script may be using relative paths incorrectly. Use the improved patching script which handles module resolution properly.

2. **Crypto Module Issues**

   If you see errors related to crypto functions, ensure the polyfills are properly loaded in the correct order in main.tsx.

3. **Buffer Not Defined**

   If you encounter "Buffer is not defined" errors, check that the buffer polyfill is properly loaded before any code that uses Buffer.

### Browser Console Errors

1. **WebSocket Connection Issues**

   VeChain TestNet occasionally has WebSocket connection issues. The application includes fallback mechanisms to handle these cases.

2. **Connex Driver Errors**

   If you see errors related to Connex driver, check that the browser polyfills are properly loaded and the patching scripts are correctly applied.

## Deployment Commands

To manually deploy:

```bash
# Install dependencies
npm ci

# Apply patches
node scripts/patch-thor-devkit-improved.cjs
node scripts/patch-vechain-module.cjs

# Build the app
npm run build
```

## Security Considerations

1. **Private Keys**
   
   Never include private keys in the client-side code. For development, we use environment variables that are only available during build time.

2. **CSP Headers**

   The Content Security Policy headers allow connections to VeChain nodes but restrict other external connections for security.

3. **HTTPS**

   All deployments use HTTPS by default on Netlify.

## Additional Resources

- [VeChain Developer Documentation](https://docs.vechain.org/)
- [thor-devkit Documentation](https://github.com/vechain/thor-devkit.js)
- [Connex Framework Documentation](https://github.com/vechain/connex-framework)

## Using with Custom Domains

When deploying to custom domains, make sure to:

1. Update the CSP headers in netlify.toml to include your domain
2. Configure the DNS records as instructed by Netlify
3. Enable HTTPS for your custom domain