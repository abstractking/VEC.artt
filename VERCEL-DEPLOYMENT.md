# Vercel Deployment Guide for VeCollab NFT Marketplace

This guide covers deploying the VeCollab NFT Marketplace to Vercel. We've implemented a custom configuration to handle Node.js module compatibility in the browser environment, especially for VeChain-specific libraries.

## Deployment Setup

### Prerequisites

1. A Vercel account connected to your GitHub repository
2. The project code with all necessary configuration files:
   - `vite.config.vercel.js`
   - `vercel.json`
   - `scripts/prepare-vercel.js`
   - `scripts/post-build-vercel.js`
   - Browser shims in `client/src/shims/`

### Environment Variables

Ensure the following environment variables are set in your Vercel project settings:

```
VITE_VECHAIN_NETWORK=test
VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
VITE_VECHAIN_TESTNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_DEPLOYMENT_ENV=vercel
```

If you need a specific private key for testing or for executing transactions, you should add:
```
VITE_VECHAIN_PRIVATE_KEY=<your_private_key>
```

If using a database, also set up the `DATABASE_URL` environment variable.

## How It Works

Our deployment process includes these key steps:

1. **Pre-build Preparation** (`prepare-vercel.js`):
   - Creates browser-compatible shims for Node.js modules like `http`, `https`, `crypto`, etc.
   - Directly patches problematic VeChain dependencies to work in the browser
   - Sets up necessary polyfills for the browser environment

2. **Custom Vite Configuration** (`vite.config.vercel.js`):
   - Configures module aliases to use our shim files
   - Sets up additional module resolution handling
   - Defines global variables and environment-specific settings

3. **Post-build Tasks** (`post-build-vercel.js`):
   - Creates API serverless functions for Vercel
   - Sets up proper routing and handler configuration
   - Creates a static fallback page for improved UX

4. **Vercel Configuration** (`vercel.json`):
   - Defines build commands and output directory
   - Sets up proper routing and API endpoints
   - Configures caching and environment variables

## Deployment Steps

1. Connect your repository to Vercel.
2. Configure the project in Vercel:
   - Framework Preset: Other
   - Build Command: `node scripts/prepare-vercel.js && vite build --config vite.config.vercel.js && node scripts/post-build-vercel.js`
   - Output Directory: `dist/public`
   - Install Command: `npm ci`

3. Add all required environment variables.
4. Deploy the project.

## Troubleshooting

If you encounter deployment issues:

1. **Node.js Module Errors**: If you encounter errors about missing Node.js modules, you might need to add additional shim files or update existing ones in `client/src/shims/`.

2. **VeChain Library Issues**: Check the patching logic in `scripts/prepare-vercel.js` to ensure all problematic dependencies are properly patched.

3. **Build Command Failures**: Verify that both preparation scripts are accessible and executable. Check Vercel build logs for specific errors.

4. **Runtime Errors**: Check the browser console for errors related to polyfills or missing functionality.

5. **Syntax Errors in Scripts**: If you encounter errors like "missing ) after argument list" or other syntax issues in the preparation scripts, check for mismatched backticks, parentheses or braces in `scripts/prepare-vercel.js` and `scripts/post-build-vercel.js`.

6. **Dependency Warnings**: Address deprecated packages and vulnerability warnings by running:
   ```
   # Use the --legacy-peer-deps flag to handle dependency conflicts with Hardhat
   npm install uuid@latest lodash.isequal@latest --legacy-peer-deps
   npm audit fix --legacy-peer-deps
   
   # Alternatively, manually install missing Hardhat peer dependencies
   npm install @nomicfoundation/hardhat-chai-matchers@^2.0.0 @nomicfoundation/hardhat-ethers@^3.0.0 @nomicfoundation/hardhat-ignition-ethers@^0.15.0 @nomicfoundation/hardhat-network-helpers@^1.0.0 @nomicfoundation/hardhat-verify@^2.0.0 @typechain/ethers-v6@^0.5.0 @typechain/hardhat@^9.0.0 @types/chai@^4.2.0 @types/mocha@>=9.1.0 chai@^4.2.0 ethers@^6.4.0 --legacy-peer-deps
   ```

## Additional Resources

- [Vercel Deployment Documentation](https://vercel.com/docs/deployments/overview)
- [Vite Build Guide](https://vitejs.dev/guide/build)
- [VeChain Developer Resources](https://developers.vechain.org/)