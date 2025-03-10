const { Wallet } = require("ethers");

/**
 * Generate a random private key and wallet address for VeChain TestNet
 * This key should only be used for development/testing purposes
 */
function generatePrivateKey() {
  const wallet = Wallet.createRandom();
  console.log('\n=== VECHAIN WALLET FOR DEVELOPMENT ===');
  console.log(`Address: ${wallet.address}`);
  console.log(`Private Key: ${wallet.privateKey}`);
  console.log('=======================================');
  console.log('\nIMPORTANT: Save this information securely and never share your private key!');
  console.log('This key can be used in the .env file as VITE_VECHAIN_PRIVATE_KEY\n');
}

generatePrivateKey();
