# Vercel Deployment Guide

This document provides detailed instructions for deploying the VeCollab NFT Marketplace on Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Git repository with your VeCollab code
3. [PostgreSQL database](https://neon.tech) (we recommend Neon.tech for Serverless PostgreSQL)

## Environment Variables

The following environment variables must be set in your Vercel project settings:

```
# Required
DATABASE_URL=your_postgres_connection_string
VITE_VECHAIN_NETWORK=test (or main for production)
VITE_VECHAIN_NODE_URL_TESTNET=https://testnet.veblocks.net
VITE_VECHAIN_NODE_URL_MAINNET=https://mainnet.veblocks.net
VITE_VECHAIN_TESTNET_GENESIS_ID=0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127
VITE_VECHAIN_MAINNET_GENESIS_ID=0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409
VITE_DEPLOYMENT_ENV=vercel

# Optional
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

## Deployment Steps

1. **Connect your repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" > "Project"
   - Select your repository and click "Import"

2. **Configure project settings**:
   - **Framework Preset**: Select "Vite"
   - **Build Command**: `node scripts/prepare-vercel.cjs && vite build --config vite.config.vercel.js && node scripts/post-build-vercel.cjs`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
   - **Development Command**: `npm run dev`

3. **Set environment variables**:
   - Add all required environment variables listed above
   - Make sure to set `VITE_DEPLOYMENT_ENV=vercel`

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

## Troubleshooting

### API Routes Not Working

If API routes return 404, check:
1. Vercel rewrites in `vercel.json` are properly configured
2. API adapter in `/api/index.js` exists after build
3. `VITE_DEPLOYMENT_ENV` is set to `vercel`

### Wallet Connection Issues

If wallet connections fail:
1. Ensure crypto polyfills are loaded correctly
2. Check browser console for errors related to crypto operations
3. Verify VeChain network settings (testnet vs mainnet)

### Database Connection Failures

If database operations fail:
1. Verify `DATABASE_URL` is correct and accessible
2. Check database permissions for the connection user
3. Ensure migrations have been applied with `drizzle-kit push`

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [VeChain Developer Resources](https://docs.vechain.org/)