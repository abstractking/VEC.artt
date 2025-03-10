# Deployment Guide for VeCollab Marketplace

This document provides detailed instructions for deploying the VeCollab Marketplace on Netlify.

## Prerequisites

Before deploying, ensure you have:

1. A Netlify account
2. Access to the GitHub repository
3. Required environment variables (if applicable)

## Environment Variables

The following environment variables need to be set in your Netlify deployment settings:

- `VITE_VECHAIN_PRIVATE_KEY`: Private key for VeChain testnet wallet (for development and testing only)
- `VITE_REACT_APP_VECHAIN_NETWORK`: Set to `test` for TestNet or `main` for MainNet

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

## Troubleshooting

Common issues and their solutions:

1. **White screen / app not loading**: Check browser console for missing polyfills or crypto-related errors.
2. **API connectivity issues**: Ensure proper network selection (TestNet vs MainNet).
3. **Build failures**: Look for issues with CommonJS/ESM compatibility in the build logs.

## Monitoring and Maintenance

After deployment:

1. Check site functionality thoroughly
2. Monitor error logs in the Netlify dashboard
3. Set up notifications for build failures

For questions or additional support, refer to the project repository documentation.