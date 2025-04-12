# Vercel Deployment Guide for VeChain NFT Marketplace

This guide walks you through the process of deploying the VeChain NFT Marketplace to Vercel with proper wallet functionality.

## Prerequisites

1. A Vercel account - [Create one here](https://vercel.com/signup) if you don't have one
2. The Vercel CLI - Install it with `npm install -g vercel`
3. The GitHub repository connected to your Vercel account

## Environment Variables

Before deploying, make sure to set the following environment variables in your Vercel project:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_DEPLOYMENT_ENV` | Deployment environment identifier | `vercel` |
| `VITE_VECHAIN_NETWORK` | VeChain network to use | `test` or `main` |
| `VITE_VECHAIN_NODE_URL_TESTNET` | TestNet node URL | `https://testnet.veblocks.net` |
| `VITE_VECHAIN_NODE_URL_MAINNET` | MainNet node URL | `https://mainnet.veblocks.net` |
| `VITE_VECHAIN_TESTNET_GENESIS_ID` | TestNet Genesis ID | `0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127` |
| `VITE_VECHAIN_MAINNET_GENESIS_ID` | MainNet Genesis ID | `0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409` |
| `DATABASE_URL` | PostgreSQL database connection string | `postgres://...` |

## Deployment Steps

### 1. Local Testing with Vercel Dev

Before deploying to Vercel, test locally with the Vercel development environment:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Run development server
vercel dev
```

This will simulate how your app will run on Vercel's servers.

### 2. Testing the Vercel Polyfills

You can verify that the Vercel wallet polyfills are functioning correctly:

```bash
# Test polyfill implementation
node vercel-polyfill-test.js

# Test full build configuration
bash vercel-test.sh
```

### 3. Deploy to Vercel

```bash
# Deploy the application
vercel

# For production deployment
vercel --prod
```

## Troubleshooting

### Wallet Connection Issues

If you encounter wallet connection issues on Vercel:

1. Check the browser console for error messages
2. Verify that the polyfills are loaded correctly (look for "Critical polyfills initialized via Vercel inline script" in console)
3. Ensure all required environment variables are set correctly in Vercel

### Common Issues

1. **MIME Type Error**: If you see "MIME type mismatch" errors, our custom polyfill system should fix this. If not, check the console for specific error messages.

2. **Invalid Genesis ID**: If you see "Invalid genesisId" errors, verify that the Genesis ID environment variables are set correctly. The app includes fallbacks but explicit configuration is better.

3. **Environment Detection**: If the app doesn't recognize it's running on Vercel, check that `VITE_DEPLOYMENT_ENV` is set to `vercel`.

## Special Considerations

### Wallet Support on Vercel

Due to the serverless nature of Vercel, certain wallet connections may not work as expected. The app includes a development wallet fallback that will be used when real wallet connections fail on Vercel.

This ensures that users always have a working experience, but with limited functionality.

For full wallet functionality:
- Self-host the application on a non-serverless platform
- Use the Netlify deployment which has better support for wallet connections

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [VeChain Developer Resources](https://docs.vechain.org/)
- [VERCEL-WALLET-FIX.md](./VERCEL-WALLET-FIX.md) - Technical details of wallet fixes
- [NETLIFY-DEPLOYMENT.md](./NETLIFY-DEPLOYMENT.md) - Alternative deployment method