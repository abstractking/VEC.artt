/**
 * VeChain TestNet Configuration Verification Tool
 * 
 * This script verifies that the necessary environment variables are present
 * and correctly formatted for VeChain TestNet interaction.
 * 
 * Run this before deployment to ensure your Netlify environment is properly configured.
 */

const { Transaction, secp256k1 } = require('thor-devkit');

// The environment variables to check
const REQUIRED_VARS = [
  'VITE_VECHAIN_PRIVATE_KEY',
  'VITE_REACT_APP_VECHAIN_NETWORK'
];

const OPTIONAL_VARS = [
  'VITE_VECHAIN_NODE_URL',
  'VITE_VECHAIN_EXPLORER_URL',
  'VITE_REACT_APP_NFT_CONTRACT_ADDRESS'
];

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Print header
console.log(`\n${colors.cyan}======================================${colors.reset}`);
console.log(`${colors.cyan}VeChain TestNet Configuration Verification${colors.reset}`);
console.log(`${colors.cyan}======================================${colors.reset}\n`);

// Check required environment variables
console.log(`${colors.magenta}Checking required environment variables:${colors.reset}`);
let missingRequired = false;

REQUIRED_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
    
    // Additional validation for specific variables
    if (varName === 'VITE_VECHAIN_PRIVATE_KEY') {
      try {
        const privateKey = process.env[varName].startsWith('0x') 
          ? process.env[varName].substring(2) 
          : process.env[varName];
          
        if (privateKey.length !== 64) {
          console.log(`  ${colors.yellow}⚠ Private key should be 64 characters (without 0x prefix)${colors.reset}`);
        } else {
          // Attempt to derive public key to verify private key validity
          try {
            const publicKey = secp256k1.derivePublicKey(Buffer.from(privateKey, 'hex'));
            console.log(`  ${colors.green}✓ Private key is valid${colors.reset}`);
            
            // Derive and display address (helpful for verification)
            try {
              const address = Transaction.getAddressFromPublicKey(publicKey);
              console.log(`  ${colors.cyan}ℹ Wallet address: 0x${address}${colors.reset}`);
            } catch (addrErr) {
              console.log(`  ${colors.yellow}⚠ Could not derive address from public key${colors.reset}`);
            }
          } catch (pkErr) {
            console.log(`  ${colors.red}✗ Invalid private key format${colors.reset}`);
          }
        }
      } catch (err) {
        console.log(`  ${colors.red}✗ Could not validate private key: ${err.message}${colors.reset}`);
      }
    }
    
    if (varName === 'VITE_REACT_APP_VECHAIN_NETWORK') {
      const network = process.env[varName].toLowerCase();
      if (network !== 'test' && network !== 'main') {
        console.log(`  ${colors.yellow}⚠ Network should be 'test' or 'main', currently set to '${network}'${colors.reset}`);
      } else if (network === 'test') {
        console.log(`  ${colors.green}✓ Network correctly set to TestNet${colors.reset}`);
      } else {
        console.log(`  ${colors.yellow}⚠ Network set to MainNet - make sure this is intentional${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.red}✗ ${varName} is not set${colors.reset}`);
    missingRequired = true;
  }
});

// Check optional environment variables
console.log(`\n${colors.magenta}Checking optional environment variables:${colors.reset}`);
OPTIONAL_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`${colors.green}✓ ${varName} is set${colors.reset}`);
    
    // Additional validation for specific variables
    if (varName === 'VITE_REACT_APP_NFT_CONTRACT_ADDRESS') {
      const address = process.env[varName];
      if (!address.startsWith('0x') || address.length !== 42) {
        console.log(`  ${colors.yellow}⚠ Contract address format may be invalid${colors.reset}`);
      }
    }
    
    if (varName === 'VITE_VECHAIN_NODE_URL') {
      const url = process.env[varName];
      if (!url.startsWith('http')) {
        console.log(`  ${colors.yellow}⚠ Node URL should start with http:// or https://${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.yellow}⚠ ${varName} is not set (optional)${colors.reset}`);
  }
});

// Summary
console.log(`\n${colors.magenta}Summary:${colors.reset}`);
if (missingRequired) {
  console.log(`${colors.red}✗ Missing required environment variables${colors.reset}`);
  console.log(`${colors.yellow}Please set all required variables before deployment${colors.reset}`);
} else {
  console.log(`${colors.green}✓ All required environment variables are set${colors.reset}`);
  
  if (process.env.VITE_REACT_APP_VECHAIN_NETWORK === 'test') {
    console.log(`${colors.green}✓ Configuration is set for TestNet${colors.reset}`);
    console.log(`${colors.cyan}You can now deploy to Netlify with TestNet support${colors.reset}`);
  } else {
    console.log(`${colors.yellow}⚠ Configuration is not set for TestNet${colors.reset}`);
    console.log(`${colors.yellow}Set VITE_REACT_APP_VECHAIN_NETWORK=test for TestNet${colors.reset}`);
  }
}

console.log(`\n${colors.cyan}======================================${colors.reset}\n`);