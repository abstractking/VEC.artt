# VeCollab - VeChain NFT Marketplace

A decentralized NFT marketplace built on VeChain blockchain, offering creators and collectors an innovative platform for minting, trading, and discovering unique digital assets with enhanced collaboration tools for artists.

## Features

- **NFT Creation & Minting**: Create, mint and list NFTs directly on the VeChain blockchain
- **Marketplace**: Buy, sell, and auction digital assets
- **Wallet Integration**: Connect with VeChain wallets or use development keys
- **Artist Verification**: Verified badge system for trusted creators
- **Real-time Notifications**: WebSocket-powered notifications for bids and sales
- **Collection Management**: Group NFTs into curated collections
- **Interactive Discovery**: Advanced browsing with filters and recommendations

## Wallet Security & Architecture

### Connection Strategies

VeCollab uses a multi-tiered approach to blockchain connections:

1. **Development Environment**:
   - Uses a private key from `.env` file if available
   - Falls back to mock wallet functionality for testing
   - Shows test data clearly labeled as development mode
   - WebSocket connection settings optimized for local/Replit environments

2. **Production Environment**:
   - Prioritizes secure wallet connections (VeChain Sync2, etc)
   - Uses private key from Netlify environment variables as fallback
   - Mock functionality is explicitly disabled
   - Enhanced WebSocket security with proper origin policies

3. **Smart Connection Logic**:
   - Automatic environment detection (Replit, local, production)
   - Graceful fallbacks for various connection scenarios
   - Real-time wallet balance updates
   - Clear error handling for connection issues

### Private Key Management

This project uses environment variables to manage sensitive information like private keys. To properly set up your development environment:

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Add your private key:**
   - Edit the `.env` file and replace `your_private_key_here` with your actual private key
   - **IMPORTANT:** NEVER commit your actual private key to Git or share it publicly
   - The `.env` file is ignored by Git to prevent accidental commits of sensitive data

3. **For production deployment on Netlify:**
   - Add your private key as an environment variable in the Netlify UI
   - Go to Site settings > Build & deploy > Environment variables
   - Add `VITE_VECHAIN_PRIVATE_KEY` with your private key value

### Development Test Keys

For development purposes, you can generate a test private key using the provided utility:

```bash
node temp-key-gen/generateKey.js
```

This will create a random private key you can use for TestNet development. Never use these keys for production or with real VET tokens.

## Security Best Practices

- Regularly rotate your development private keys
- Use different keys for development and production
- Consider using Netlify's environment variable encryption for added security
- For production, it's recommended to integrate with a secure wallet solution rather than using private keys directly
- Use TestNet for all development and testing work
- Add proper CSP headers to prevent malicious scripts (already configured in netlify.toml)
- Test wallet functionality thoroughly before deploying with real assets

## Development and Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Netlify Deployment
This project is configured for Netlify deployment using the `netlify.toml` file. 
The configuration includes:

- Build settings 
- Required redirects for SPA routing
- Security headers for WebSocket connections
- Cache optimization
- Environment-specific configurations

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.