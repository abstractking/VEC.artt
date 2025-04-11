/**
 * VeChain DApp Kit Configuration
 * 
 * This module provides the recommended configuration for VeChain DApp Kit
 * with settings optimized for our application.
 */

import { Network, getNodeUrl } from './Network';

// Check environment for TestNet or MainNet
const isTestNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK !== 'main';
const network = isTestNet ? 'test' : 'main';

// Get WalletConnect Project ID if available
const walletConnectProjectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || '';

// WalletConnect configuration
export const walletConnectConfig = {
  projectId: walletConnectProjectId,
  chains: [isTestNet ? 'vechain:testnet' : 'vechain:mainnet'],
  showQrModal: true,
  methods: ['eth_sendTransaction', 'eth_sign', 'personal_sign'],
  optionalMethods: ['eth_signTypedData', 'eth_signTypedData_v4'],
  rpcMap: {
    'vechain:mainnet': 'https://mainnet.veblocks.net',
    'vechain:testnet': 'https://testnet.veblocks.net'
  }
};

// DApp Kit configuration options
export const dAppKitOptions = {
  // Node URL from our Network configuration
  node: getNodeUrl(isTestNet ? Network.TEST : Network.MAIN),

  // Network setting (test or main)
  network,

  // WalletConnect configuration
  walletConnectOptions: walletConnectConfig, // Use the new config

  // Enable persistence of wallet connection
  usePersistence: true,

  // Use first detected source for convenience
  useFirstDetectedSource: false,

  // Enable debug logging in development
  logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'ERROR'
};

// Allowed wallets for our application
export const allowedWallets = ['veworld', 'sync2', 'sync', 'wallet-connect'];

// Helper to determine if WalletConnect is properly configured
export function isWalletConnectConfigured(): boolean {
  return !!walletConnectProjectId && walletConnectProjectId.length > 0;
}