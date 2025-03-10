# Deployment Guide for VeCollab Marketplace

This guide provides instructions for deploying the VeCollab Marketplace to production.

## Prerequisites

- Node.js 16+ installed
- A Netlify account
- VeChain wallet credentials for production

## Build Process

1. Ensure all dependencies are installed:
   ```
   npm install
   ```

2. Build the application:
   ```
   npm run build
   ```

3. The build output will be in the `dist` directory.

## Deployment to Netlify

### Option 1: Deploy from Netlify Dashboard

1. Connect your GitHub repository to Netlify
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables:
   - `VITE_VECHAIN_NETWORK`: Set to `main` for mainnet or `test` for testnet
   - `VITE_VECHAIN_PRIVATE_KEY`: Your VeChain private key (if using test mode)
   - `NODE_ENV`: Set to `production`

### Option 2: Deploy with Netlify CLI

1. Install Netlify CLI if you haven't already:
   ```
   npm install -g netlify-cli
   ```

2. Log in to your Netlify account:
   ```
   netlify login
   ```

3. Initialize Netlify in your project (if not already done):
   ```
   netlify init
   ```

4. Deploy your site:
   ```
   netlify deploy --prod
   ```

## Client-Side Routing Configuration

To fix 404 errors with client-side routing, the project includes:

1. A `netlify.toml` file with redirect rules
2. A `public/_redirects` file as a backup

These configurations tell Netlify to serve the `index.html` file for all routes, allowing the client-side router to handle them properly.

## Security Considerations

1. Never commit private keys to the repository
2. Use environment variables for sensitive information
3. In production, always use a secure wallet connection rather than storing private keys
4. Ensure proper headers are set in the `netlify.toml` file

## Troubleshooting Deployment Issues

1. **404 Errors on Routes**: If you're still experiencing 404 errors on page refresh or direct URL access:
   - Verify that the `netlify.toml` file was included in your deployment
   - Check Netlify deploy logs for any errors
   - Try adding the `_redirects` file directly to the `dist` folder after building

2. **Missing Environment Variables**: If wallet connections or API calls fail:
   - Check that all environment variables are properly set in Netlify
   - Ensure variable names match exactly what the application expects

3. **Build Failures**: If the build process fails:
   - Check Node.js version compatibility
   - Verify all dependencies are installed correctly
   - Look for polyfill issues that might affect the build process

## Post-Deployment Verification

After deployment, verify that:
1. The application loads correctly on the root path
2. Navigating to different routes directly works without 404 errors
3. Wallet connections work
4. NFT minting and trading functions operate as expected
5. All APIs are responding properly