# VeCollab Marketplace Deployment Guide

This guide provides step-by-step instructions for deploying the VeCollab marketplace to Netlify.

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] A VeChain wallet with TestNet tokens for testing
- [ ] Your private key safely stored (never commit to Git)
- [ ] Smart contract deployed to TestNet (or contract address you plan to interact with)
- [ ] Git repository with your code

## Deployment Steps

### 1. Connect Repository to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your VeCollab repository
5. Keep the default settings from the `netlify.toml` file:
   - Build command: `npm ci && npm run build` (ensures dependencies are installed first)
   - Publish directory: `dist`

> **Important**: The build command explicitly includes `npm ci` to ensure all dependencies are installed properly before running the build. Without this, you might encounter `vite: not found` errors during deployment.

### 2. Configure Environment Variables

In the Netlify UI, go to **Site settings > Build & deploy > Environment variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_VECHAIN_PRIVATE_KEY` | Your private key | Securely stored in Netlify, never in Git |
| `VITE_REACT_APP_VECHAIN_NETWORK` | `test` or `main` | Which VeChain network to use |
| `VITE_REACT_APP_NFT_CONTRACT_ADDRESS` | Your contract address | Address of deployed smart contract |

### 3. Deploy the Site

1. Click "Deploy site"
2. Wait for the build and deployment to complete
3. Once deployed, Netlify will provide a URL to access your site

### 4. Post-Deployment Verification

After deployment, verify the following:

1. Visit your deployed site
2. Ensure wallet connection works
3. Test NFT creation and transaction features
4. Verify blockchain interactions are working as expected

## Troubleshooting

### Build Errors

#### "vite: not found" Error

If you encounter a build error like this:
```
sh: 1: vite: not found
Error message: Command failed with exit code 127: npm run build
```

Solutions:
1. Make sure your `netlify.toml` file includes `npm ci` before the build command:
   ```toml
   command = "npm ci && npm run build"
   ```
2. Check that `vite` is included in your package.json's devDependencies
3. Verify your Node.js version in Netlify is compatible (we recommend Node 18+)

### WebSocket Connection Issues

If you encounter WebSocket connection issues:

1. Check that your CSP allows connections to `wss://testnet.veblocks.net/socket` and `wss://mainnet.veblocks.net/socket`
2. Ensure your browser supports WebSockets
3. Verify network connectivity to VeChain nodes

### Wallet Connection Issues

If wallet connection fails:

1. Ensure your private key is correctly set in Netlify environment variables
2. Check browser console for specific errors
3. Verify you're connecting to the correct network (TestNet/MainNet)

## Updating Your Deployment

To update your deployment:

1. Make changes to your code
2. Commit and push to your Git repository
3. Netlify will automatically trigger a new build and deployment

## Custom Domain (Optional)

To set up a custom domain:

1. Go to Netlify site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure DNS settings

## Security Considerations

- Never expose your private key in client-side code
- Use Netlify's environment variables for secure storage
- Regularly rotate your private keys
- Use different keys for development and production

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [VeChain Developer Documentation](https://docs.vechain.org/)
- [Web3 Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)