# VeCollab Marketplace Deployment Guide

## Netlify Deployment

The VeCollab Marketplace is configured for deployment on Netlify. This document outlines important aspects of the deployment process and troubleshooting tips.

### Configuration

The deployment is configured via the `netlify.toml` file, which includes:

- Build commands and settings
- Environment variables
- Security headers
- Caching policies
- Redirects for client-side routing

### Known Issues and Solutions

#### Node.js Module Compatibility in Browser

The project uses `thor-devkit` which imports Node.js native modules like `crypto`. These don't work in a browser environment. To address this:

1. We've created browser-compatible polyfills in `client/src/lib/secp256k1-browser.ts` and `client/src/lib/thor-polyfills.ts`
2. We've implemented a patching script (`scripts/patch-thor-devkit.js`) that runs during the Netlify build process and replaces the Node.js crypto imports with browser-compatible alternatives

This approach allows us to use the thor-devkit library without modifying its source code directly.

#### WebSocket Connection Stability

The application uses WebSockets for real-time notifications. To ensure stable connections:

1. We've implemented an exponential backoff reconnection strategy
2. The client tries to reconnect automatically if disconnected
3. The server keeps track of connected clients and cleans up properly on disconnection

### Environment Variables

For the application to work correctly, you must set these environment variables in the Netlify UI:

- `VITE_REACT_APP_VECHAIN_NETWORK`: Set to "main" for MainNet or "test" for TestNet
- `VITE_REACT_APP_NFT_CONTRACT_ADDRESS`: The deployed contract address for the NFT marketplace
- `VITE_VECHAIN_PRIVATE_KEY`: For TestNet only, a private key for signing transactions

### Manual Deployments

If you need to trigger a manual deployment:

1. Commit and push your changes to the main branch
2. Netlify will automatically build and deploy the application
3. You can also trigger a manual deploy from the Netlify UI

### Troubleshooting

If the deployment fails with errors related to Node.js modules:

1. Check the build logs for specific error messages
2. Ensure the patching script is correctly modifying the thor-devkit imports
3. You may need to update the patching script if thor-devkit changes in future versions