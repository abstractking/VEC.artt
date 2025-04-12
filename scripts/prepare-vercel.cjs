/**
 * Vercel Pre-build Script
 * This script prepares the environment for Vercel deployment
 */

console.log("Preparing environment for Vercel deployment...");

// Set production environment
process.env.NODE_ENV = "production";

// Configure VeChain network variables if not already set
if (!process.env.VITE_VECHAIN_NETWORK) {
  console.log("Setting default VeChain network to test");
  process.env.VITE_VECHAIN_NETWORK = "test";
}

if (!process.env.VITE_VECHAIN_NODE_URL_TESTNET) {
  console.log("Setting default TestNet node URL");
  process.env.VITE_VECHAIN_NODE_URL_TESTNET = "https://testnet.veblocks.net";
}

if (!process.env.VITE_VECHAIN_NODE_URL_MAINNET) {
  console.log("Setting default MainNet node URL");
  process.env.VITE_VECHAIN_NODE_URL_MAINNET = "https://mainnet.veblocks.net";
}

// Genesis IDs for VeChain networks
if (!process.env.VITE_VECHAIN_TESTNET_GENESIS_ID) {
  console.log("Setting TestNet Genesis ID");
  process.env.VITE_VECHAIN_TESTNET_GENESIS_ID = "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127";
}

if (!process.env.VITE_VECHAIN_MAINNET_GENESIS_ID) {
  console.log("Setting MainNet Genesis ID");
  process.env.VITE_VECHAIN_MAINNET_GENESIS_ID = "0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409";
}

// Set deployment environment
process.env.VITE_DEPLOYMENT_ENV = "vercel";

console.log("Environment prepared for Vercel deployment");