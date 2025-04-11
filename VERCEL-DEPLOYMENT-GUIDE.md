# Vercel Deployment Guide for VeChain NFT Marketplace

This guide provides step-by-step instructions for deploying your VeChain NFT Marketplace application to Vercel.

## Deployment Prerequisites

1. A Vercel account connected to your GitHub repository
2. Proper configuration files (as included in this repository)

## Summary of Vercel Deployment Process

Our Vercel deployment uses a specialized build process designed to handle the complexities of VeChain blockchain libraries in a browser environment:

1. **Pre-build preparation** script fixes Node.js module compatibility
2. **Custom build configuration** handles browser polyfills
3. **Post-build processing** creates serverless API functions

## Quick Deployment Steps

1. Connect your repository to Vercel
2. Use the following configuration in the Vercel dashboard:
   - **Framework Preset**: Other
   - **Build Command**: `./scripts/vercel-build.sh`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm ci --legacy-peer-deps`

3. Add all environment variables from `vercel.json` to your Vercel project settings
4. Deploy the project!

## Environment Variables

Be sure to configure the following environment variables in your Vercel project:

```
VITE_VECHAIN_NETWORK=test
VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
VITE_VECHAIN_TESTNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_DEPLOYMENT_ENV=vercel
```

If you're using a database, also add:
```
DATABASE_URL=<your-database-connection-string>
```

## Troubleshooting

### Common Issues

1. **Build Failures**: If the build fails, check Vercel logs for specific errors.
   - Most common issues relate to Node.js module compatibility
   - Our `fix-duplicated-agents.cjs` script addresses common module declaration issues

2. **Missing Environment Variables**: Ensure all required variables are set in your Vercel project.

3. **API Routes Not Working**: Verify that the API routes are correctly set up in the Vercel configuration.
   - Our post-build script creates the necessary serverless functions

### Specific Troubleshooting Steps

If you encounter the "HttpAgent already declared" error:
- This is fixed by running `node scripts/fix-duplicated-agents.cjs` before the build
- Our build script handles this automatically

## Backend/API Configuration

The API functionality is handled through Vercel serverless functions, which are automatically configured by our build process. The API routes match your development environment 1:1 without any additional configuration needed.

## Final Notes

- After deployment, your app will be available at your-project-name.vercel.app
- You can set up a custom domain in the Vercel dashboard
- Our deployment is optimized for the VeChain TestNet by default, change environment variables for MainNet