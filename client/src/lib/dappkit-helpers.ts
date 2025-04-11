/**
 * Helper functions for DAppKit initialization and connection
 * These functions help ensure cross-platform compatibility
 */
import * as React from 'react';

// Define Genesis IDs for VeChain networks
export const GENESIS_IDS = {
  main: '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a',
  test: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127'
};

/**
 * Safely load the DAppKit UI module
 * This helps with SSR and with environments where the module might fail to load
 */
export const loadDAppKitUI = async () => {
  try {
    // Dynamic import with a timeout to prevent hangs
    const modulePromise = import('@vechain/dapp-kit-ui');
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('DAppKit module import timed out')), 5000);
    });
    
    const { DAppKitUI } = await Promise.race([modulePromise, timeoutPromise]) as any;
    return { DAppKitUI, error: null };
  } catch (error) {
    console.error('[DAppKit] Failed to load DAppKit UI module:', error);
    return { DAppKitUI: null, error };
  }
};

/**
 * Detect if running in a browser environment
 */
export const isBrowser = () => typeof window !== 'undefined';

/**
 * Detect if the current device is mobile
 */
export const isMobileDevice = () => {
  if (!isBrowser()) return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * Check if a specific wallet extension is available in the browser
 */
export const isWalletExtensionAvailable = (type: string): boolean => {
  if (!isBrowser()) return false;
  
  switch (type) {
    case 'veworld':
      return typeof window.vechain !== 'undefined';
    case 'sync2':
      return typeof window.connex !== 'undefined';
    default:
      return false;
  }
};

/**
 * Get available DAppKit-compatible wallets
 */
export const getAvailableWallets = () => {
  const wallets = [];
  
  if (isWalletExtensionAvailable('veworld')) {
    wallets.push('veworld');
  }
  
  if (isWalletExtensionAvailable('sync2')) {
    wallets.push('sync2');
  }
  
  // WalletConnect is always available
  wallets.push('wallet-connect');
  
  return wallets;
};

/**
 * Create a standardized DAppKit configuration
 */
export const createDAppKitConfig = (networkName: 'main' | 'test', nodeUrl?: string) => {
  // Default node URLs if not provided
  const defaultNodeUrls = {
    main: 'https://mainnet.veblocks.net',
    test: 'https://testnet.veblocks.net'
  };
  
  // Set up WalletConnect options
  const walletConnectOptions = {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5e81b15898eb5b868a361ed4f72f1293',
    metadata: {
      name: 'VeCollab',
      description: 'A decentralized collaboration platform on VeChain',
      url: isBrowser() ? window.location.origin : 'https://vecollab.io',
      icons: [isBrowser() ? `${window.location.origin}/logo.png` : 'https://vecollab.io/logo.png'],
    },
  };
  
  // Configuration options
  return {
    nodeUrl: nodeUrl || defaultNodeUrls[networkName],
    genesis: GENESIS_IDS[networkName],
    useFirstDetectedSource: false,
    usePersistence: true,
    walletConnectOptions,
    logLevel: import.meta.env.DEV ? 'DEBUG' : 'ERROR',
    themeMode: 'LIGHT',
    allowedWallets: getAvailableWallets()
  };
};