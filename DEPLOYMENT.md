# Deployment Guide for VeCollab Marketplace

This document provides detailed instructions for deploying the VeCollab Marketplace on Netlify.

## Prerequisites

Before deploying, ensure you have:

1. A Netlify account
2. Access to the GitHub repository
3. Required environment variables (if applicable)

## Environment Variables

The following environment variables must be set in your Netlify deployment settings to enable TestNet functionality:

### Required Environment Variables

- `VITE_VECHAIN_PRIVATE_KEY`: Private key for VeChain TestNet wallet
  - This is required for signing transactions on the TestNet
  - Keep this private and secure as it has control over your TestNet funds
  - Use a dedicated wallet for TestNet only, never use a production wallet's key

- `VITE_REACT_APP_VECHAIN_NETWORK`: Set to `test` for TestNet or `main` for MainNet
  - For production testing, use `test` to connect to the TestNet
  - Only use `main` when you're ready to deploy to production with real transactions

### Optional Environment Variables

- `VITE_VECHAIN_NODE_URL`: Custom VeChain node URL (defaults to official TestNet node)
- `VITE_VECHAIN_EXPLORER_URL`: VeChain explorer URL for transaction links
- `VITE_REACT_APP_NFT_CONTRACT_ADDRESS`: The deployed NFT contract address on TestNet

### Setting Up TestNet Wallet

1. Generate a new private key for TestNet using the thor-devkit utility
2. Request TestNet VET and VTHO from the [VeChain TestNet Faucet](https://faucet.vecha.in/)
3. Add the private key to Netlify environment variables
4. Never share or commit this private key to version control

## Deployment Steps

### Option 1: Direct Deployment from GitHub

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select GitHub as your Git provider
4. Authorize Netlify to access your GitHub account
5. Select the repository containing the VeCollab Marketplace
6. Configure build settings:
   - Build command: `node scripts/patch-thor-devkit.cjs && npm run build && node scripts/prepare-netlify.cjs`
   - Publish directory: `dist/public`
7. Add the required environment variables
8. Click "Deploy site"

### Option 2: Manual Deployment

1. Build the project locally:
   ```bash
   npm run build
   ```
2. Deploy the `dist/public` directory to Netlify:
   ```bash
   npx netlify deploy --prod --dir=dist/public
   ```

## Build Configuration

The build process includes several critical steps:

1. **Patching thor-devkit**: The `patch-thor-devkit.cjs` script modifies the thor-devkit library to work in the browser environment.
2. **Building the application**: `npm run build` compiles and bundles the application.
3. **Post-build processing**: `prepare-netlify.cjs` sets up necessary Netlify configuration files like `_redirects` and `_headers`.

## Important Notes

- **Module Format**: The project uses ES modules by default. Build scripts use the `.cjs` extension to ensure proper CommonJS execution in the Netlify environment.
- **Browser Compatibility**: Extensive polyfills are used to ensure compatibility with VeChain libraries in the browser.
- **Redirects**: The deployment includes configuration for client-side routing via the `_redirects` file.

## Using Real TestNet Transactions

For the deployed application to perform real TestNet transactions:

1. **Enable "Real Wallet" Mode**: In the Connect Wallet dialog, toggle "Real Wallet Interaction" to ON
   - This will switch from simulated transactions to real TestNet transactions
   - You'll need to have a compatible VeChain wallet extension installed, or
   - The application will use the private key specified in environment variables to sign transactions

2. **Verify Transaction Flows**:
   - Create an NFT to test minting functionality
   - List an NFT for sale to test marketplace functionality
   - Place a bid on an NFT to test bidding functionality
   - All of these operations should result in real TestNet transactions when in "Real Wallet" mode

3. **View Transactions on Explorer**:
   - After a successful transaction, you can view it on the TestNet explorer
   - Transaction links should automatically appear after transactions complete
   - The explorer URL is: `https://explore-testnet.vechain.org/transactions/{txid}`

## Troubleshooting

Common issues and their solutions:

1. **White screen / app not loading**: Check browser console for missing polyfills or crypto-related errors.

2. **API connectivity issues**: 
   - Ensure proper network selection (TestNet vs MainNet)
   - Verify the TestNet node is responding (`https://testnet.veblocks.net`)
   - Check console logs for any connection errors to the node

3. **Build failures**: 
   - Look for issues with CommonJS/ESM compatibility in the build logs
   - Check that the patch scripts completed successfully
   
4. **Transaction failures**:
   - Ensure the wallet has sufficient VET and VTHO for gas fees
   - Check that the private key is correctly set in environment variables
   - Verify transaction parameters in the console logs

## Monitoring and Maintenance

After deployment:

1. Check site functionality thoroughly
2. Monitor error logs in the Netlify dashboard
3. Set up notifications for build failures

For questions or additional support, refer to the project repository documentation.