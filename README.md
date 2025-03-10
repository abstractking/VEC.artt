# VeCollab - VeChain NFT Marketplace

A decentralized NFT marketplace built on VeChain blockchain, offering creators and collectors an innovative platform for minting, trading, and discovering unique digital assets.

## Security and Environment Variables

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

### Security Best Practices

- Regularly rotate your development private keys
- Use different keys for development and production
- Consider using Netlify's environment variable encryption for added security
- For production, it's recommended to integrate with a secure wallet solution rather than using private keys directly

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
- Security headers
- Cache optimization