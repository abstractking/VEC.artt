# Security Policy

## VeCollab Marketplace Security Guidelines

As a blockchain application dealing with digital assets, security is paramount. This document outlines security practices and guidelines for developers, maintainers, and users of the VeCollab Marketplace.

## Private Key Management

### TestNet Private Keys

- **Environment Variables**: Always store the TestNet private key as an environment variable (`VITE_VECHAIN_PRIVATE_KEY`) in your deployment platform (e.g., Netlify)
- **Separate TestNet Wallets**: Always use a separate wallet for TestNet that's never used for MainNet transactions
- **Fund Limitations**: Maintain minimal funds in TestNet wallets - only enough for testing purposes
- **Key Rotation**: Periodically rotate TestNet private keys, especially after extensive public testing

### MainNet Private Keys

- **NEVER** store MainNet private keys in:
  - Environment variables
  - Frontend code
  - Version control
  - Deployment platforms
- **DO NOT** use the same private key/wallet between TestNet and MainNet
- For MainNet, use only:
  - User wallets through web extensions (VeChainThor, Sync2)
  - Hardware wallets
  - Custodial solutions with proper security auditing

## Secure Configuration

### Network Selection

- Use the environment variable `VITE_REACT_APP_VECHAIN_NETWORK` to control network selection:
  - `test` for TestNet
  - `main` for MainNet
- Verify network selection before every deployment
- Include clear network indicators in the UI to distinguish TestNet from MainNet

### Contract Interactions

- Always validate contract interactions before sending transactions
- Include transaction confirmation steps with clear detail displays
- Implement gas estimation and fee calculations before transaction submission
- Never automatically sign transactions without user confirmation

## Frontend Security

### Data Handling

- Never expose sensitive data in frontend code
- Use proper data validation for all user inputs
- Sanitize all data displayed to prevent XSS attacks
- Implement proper error handling that doesn't expose implementation details

### External Libraries

- Keep dependencies updated to mitigate known vulnerabilities
- Perform security audits on third-party libraries before integration
- Monitor for security advisories related to used dependencies

## Mock vs. Real Wallet Mode

VeCollab Marketplace includes a mock wallet mode for development and demonstration purposes:

### Mock Wallet Mode

- Simulates blockchain interactions without real transactions
- Safe for demonstrations and UI testing
- Does not require private keys or real VET/VTHO
- Clearly indicated in the UI when active

### Real Wallet Mode

- Performs actual blockchain transactions
- Requires proper wallet configuration (extension or private key)
- Consumes real VET/VTHO as gas
- Must be explicitly enabled by toggling the "Real Wallet" option

## Vulnerability Reporting

If you discover a security vulnerability, please DO NOT create a public GitHub issue. Instead:

1. Email details to [security@vecollab.example.com](mailto:security@vecollab.example.com)
2. Include as much information as possible:
   - Type of issue
   - Location of the affected source code
   - Step-by-step reproduction instructions
   - Potential impact
3. Allow time for the issue to be addressed before any public disclosure

## Regular Security Practices

- Run regular security audits
- Keep all dependencies up-to-date
- Use static code analysis tools
- Perform penetration testing before major releases
- Follow blockchain security best practices