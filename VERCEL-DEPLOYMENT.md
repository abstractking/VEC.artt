# Vercel Deployment Guide for VeCollab Marketplace

This guide provides detailed instructions for deploying the VeCollab NFT Marketplace to Vercel, ensuring all blockchain functionality works correctly.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. The Vercel CLI installed (optional, for local testing)
3. Your VeChain wallet setup and test credentials

## Configuration Files

The repository includes several Vercel-specific configuration files:

- `vercel.json` - Main configuration for Vercel deployment
- `vite.config.vercel.js` - Vercel-specific Vite configuration
- `vite.config.unified.ts` - Base configuration that all environments extend from
- `api/index.js` - API adapter for Vercel serverless functions
- `client/src/vercel-polyfills.js` - Vercel-specific polyfills for browser compatibility
- `scripts/prepare-vercel.cjs` - Pre-build script for Vercel deployments
- `scripts/post-build-vercel.cjs` - Post-build optimizations for Vercel
- `scripts/verify-deployment.cjs` - Tool to verify deployment readiness

## Environment Variables

Ensure the following environment variables are set in your Vercel project settings:

```
VITE_VECHAIN_NETWORK=test
VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
VITE_VECHAIN_TESTNET_GENESIS_ID=0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127
VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_DEPLOYMENT_ENV=vercel

# Database connection (if using PostgreSQL)
DATABASE_URL=postgresql://...
```

## Deployment Steps

### 1. Verify Deployment Readiness

Run the verification script to check if your project is ready for Vercel deployment:

```bash
node scripts/verify-deployment.cjs
```

Fix any issues reported by the verification script before proceeding.

### 2. Connect Repository to Vercel

1. Log in to your Vercel dashboard
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project:
   - Build Command: Leave empty (defined in vercel.json)
   - Output Directory: Leave empty (defined in vercel.json)
   - Framework Preset: Vite
5. Add environment variables from the list above
6. Click "Deploy"

### 3. Troubleshooting Common Issues

#### Wallet Connection Issues

If you experience wallet connection problems on the deployed site:

1. Check browser console for errors
2. Verify the Genesis ID values in environment variables
3. Ensure the wallet detection is working with Vercel's polyfills

#### API Connection Issues

If the frontend can't connect to the API:

1. Check the Network tab in browser developer tools
2. Verify the API adapter is correctly handling requests in `/api/index.js`
3. Make sure the rewrite rules in `vercel.json` are directing traffic correctly

#### Polyfill-Related Errors

If crypto or node.js related polyfill errors appear:

1. Check that `client/src/vercel-polyfills.js` is being loaded early
2. Verify the shim files in `client/src/shims/` are correctly aliased
3. Make sure browser-specific crypto implementations are working

## Debugging Tools

This repository includes several tools to help debug deployment issues:

1. Browser Error Tracking: The app captures and displays critical errors in the loading screen if the app fails to load
2. Environment Variable Display: Go to `/debug` route on your deployed app to see non-sensitive environment variables
3. API Status: Visit `/api/status` to check if the API is functioning correctly

## Publishing Updates

After making changes to your code:

1. Push changes to your connected Git repository
2. Vercel will automatically deploy the updates
3. Check the deployment logs for any build errors

## Support and Resources

If you encounter issues not covered in this guide:

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- VeChain SDK Documentation: [vechain.github.io](https://vechain.github.io)
- Update the `scripts/verify-deployment.cjs` to add more checks if needed