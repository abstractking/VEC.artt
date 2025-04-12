# VeCollab NFT Marketplace

A cutting-edge decentralized NFT marketplace leveraging VeChain blockchain to provide creators and collectors with an immersive, interactive platform for digital asset discovery and trading.

## Deployment Options

This repository has been optimized for deployment on multiple platforms:

### Replit Deployment

The application is already configured to run on Replit with the necessary workflows set up.

To start the application on Replit:
1. Use the "Start application" workflow
2. The server will automatically start on port 5000

### Vercel Deployment

For detailed Vercel deployment instructions, see [VERCEL-DEPLOYMENT.md](./VERCEL-DEPLOYMENT.md)

Key files for Vercel deployment:
- `vercel.json` - Configuration for Vercel deployment
- `vite.config.vercel.js` - Vite configuration optimized for Vercel
- `scripts/prepare-vercel.cjs` - Pre-build setup for Vercel
- `scripts/post-build-vercel.cjs` - Post-build adjustments for Vercel
- `api/index.js` - API adapter for Vercel serverless functions

To verify your deployment readiness:
```bash
node scripts/verify-deployment.cjs
```

## Environment Variables

See `.env.example` for all required environment variables.

## Core Technologies

- VeChain blockchain integration
- TypeScript React frontend
- Comprehensive polyfill support for cross-browser compatibility
- Real-time WebSocket notifications
- Advanced wallet connection methods (VeWorld, Thor, Sync, WalletConnect)
- PostgreSQL database with Drizzle ORM
- Node.js module shimming for browser compatibility