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

## Implementation Details

Our approach to solve compatibility issues involves several key strategies:

### 1. Module Compatibility

VeChain libraries were designed for Node.js but need to run in browsers:

- **Runtime Polyfills**: We provide browser-compatible versions of Node.js core modules
- **Package Patching**: We modify Node.js-specific code during build
- **Environment Detection**: Code detects browser vs Node.js environments and adapts accordingly

### 2. Workflow

The deployment pipeline:

1. **Pre-build Patching**: Before Vite builds the application, our patching scripts:
   - Scan `node_modules` for Node.js-specific imports
   - Replace them with browser-compatible alternatives
   - Create necessary polyfill implementations
2. **Polyfill Injection**: Required polyfills are injected into the application
3. **Building**: Vite then builds the application with all patches applied
4. **Optimization**: Static files are optimized for production

## Polyfill System

The VeChain libraries (thor-devkit and @vechain/connex-driver) are primarily designed for Node.js environments and use several Node.js core modules like `crypto`, `stream`, and others. For browser compatibility, we use:

### 1. Core Polyfills

These files provide essential Node.js functionality in the browser:

- `globalPolyfill.js` - Makes `window.global = window`
- `processPolyfill.js` - Provides Node.js process object 
- `bufferPolyfill.js` - Provides Buffer implementation
- `streamPolyfill.js` - Implements stream interface

### 2. Module Polyfills

We provide browser-compatible versions of Node.js modules:

- `crypto-browserify` - Cryptography functions
- `stream-browserify` - Stream implementation
- `path-browserify` - Path manipulation utilities
- `os-browserify` - Operating system utilities
- `buffer` - Buffer implementation
- `events` - Event emitter functionality
- `util` - Utility functions
- `assert` - Testing assertions

### 3. VeChain-Specific Polyfills

We created custom implementations for VeChain-specific needs:

- `thor-polyfills.ts` - Provides crypto implementations that thor-devkit expects
- `secp256k1-browser.ts` - Implementation of secp256k1 cryptography using elliptic.js
- `browser-info.ts` - Runtime environment detection

## Troubleshooting

### Common Build Issues

1. **Path Resolution Problems**

   If you see errors like "Could not resolve '../../../client/src/lib/thor-polyfills'", use `patch-thor-devkit-improved.cjs` which fixes these by using direct imports from node_modules.

2. **Crypto Module Issues**

   If you see errors related to crypto functions:
   - Ensure crypto-browserify is installed
   - Verify polyfills are loaded in correct order in main.tsx
   - Check thor-polyfills.ts functions match what thor-devkit expects

3. **Buffer Not Defined**

   If you encounter "Buffer is not defined" errors:
   - Make sure buffer polyfill loads before code that uses Buffer
   - Verify globalThis.Buffer is properly set
   - Check that 'buffer' package is installed

4. **Missing Type Definitions**

   For TypeScript errors, check:
   - browser-polyfills.d.ts has proper module declarations
   - Window interface is properly extended
   - Type declarations for browserify modules exist

### Browser Console Errors

1. **WebSocket Connection Issues**

   VeChain TestNet occasionally has WebSocket connection issues. The application includes fallback mechanisms to handle these cases.

2. **Connex Driver Errors**

   If you see errors related to Connex driver:
   - Check browser polyfills are loaded
   - Verify patching scripts were applied
   - Look for missing Node.js module errors

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
- [Vite Build Documentation](https://vitejs.dev/guide/build.html)
- [Browserify Handbook](https://github.com/browserify/browserify-handbook)

## Using with Custom Domains

When deploying to custom domains, make sure to:

1. Update the CSP headers in netlify.toml to include your domain
2. Configure the DNS records as instructed by Netlify
3. Enable HTTPS for your custom domain