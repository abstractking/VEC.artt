# Netlify Deployment Guide for VeCollab Application

This document outlines the special considerations for deploying this VeChain-based application on Netlify, along with the solutions implemented to address common issues.

## Key Components for Successful Deployment

### 1. Crypto Polyfill System

The application uses a robust crypto polyfill system located in:
- `client/src/crypto-setup.ts`: Initializes crypto polyfills before any other imports
- `client/src/lib/thor-polyfills.ts`: Provides compatibility functions for Thor's cryptography

IMPORTANT: The import order in `main.tsx` must be maintained, with crypto-setup.ts being imported first.

### 2. Build Script Configuration

A specialized build script has been implemented in `scripts/netlify-build.cjs` that:
- Ensures all dependencies are installed correctly
- Creates polyfill stubs dynamically
- Injects polyfills into the HTML template
- Provides multiple fallback build configurations
- Handles patching for VeChain libraries

### 3. Environment Detection

The application includes environment detection to handle:
- Development environments
- Replit environment
- Netlify production environment

### 4. Genesis ID Handling

VeChain requires correct Genesis IDs for network identification:
- The application automatically uses the proper Genesis ID based on the environment
- Environment variables are configured in netlify.toml

## Deployment Process

1. Ensure all code changes are committed and pushed
2. Connect your Netlify account to the repository
3. Use the following build settings:
   - Build command: `node scripts/netlify-build.cjs`
   - Publish directory: `dist/public`

## Troubleshooting

If build failures occur:
1. Check Netlify logs for specific error messages
2. Verify that all dependencies are correctly listed in package.json
3. Ensure the crypto polyfills are correctly imported before other code
4. Check that environment variables are properly set in Netlify settings
5. Try clearing the Netlify cache and redeploying

### Known Issues and Solutions

#### Missing @vitejs/plugin-react Error
If you see an error like `Cannot find package '@vitejs/plugin-react'`, this indicates that the React plugin dependency is not being correctly installed or located. Our build script implements multiple fallback mechanisms:

1. It attempts to install the package globally and locally
2. It provides fallback configurations that can work without the plugin
3. It includes a CommonJS fallback configuration for environments that have issues with ESM imports
4. As a last resort, it attempts to build without any configuration

The most reliable solution is to ensure that `@vitejs/plugin-react` is explicitly listed in both the dependencies and devDependencies sections of package.json.

## Implementation Notes

- We use a multi-stage fallback approach in the build script with multiple configuration options:
  1. Main configuration with full node polyfills and React plugin
  2. Simplified configuration with React plugin only
  3. Ultra-minimal ESM configuration with optional React plugin
  4. CommonJS configuration as a last resort
  5. Direct build without configuration if all else fails
- We inject polyfills directly into the HTML before any JavaScript executes
- We install dependencies in multiple ways to ensure they're available:
  1. Global installation of critical tools
  2. Full package installation from package.json
  3. Individual critical package installation with error handling
- We provide environment-specific handling for VeChain wallet connections
- We use various polyfill techniques to ensure compatibility across environments

## Environment Variables

The following environment variables should be set in Netlify:

```
VITE_REACT_APP_VECHAIN_NETWORK = "test" (or "main" for production)
VITE_VECHAIN_NODE_URL_TESTNET = "https://testnet.veblocks.net"
VITE_VECHAIN_NODE_URL_MAINNET = "https://mainnet.veblocks.net"
VITE_VECHAIN_TESTNET_GENESIS_ID = "0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409"
VITE_VECHAIN_MAINNET_GENESIS_ID = "0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409"
VITE_DEPLOYMENT_ENV = "netlify"
```

These variables are already configured in the netlify.toml file.