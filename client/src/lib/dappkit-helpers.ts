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
  
  try {
    switch (type) {
      case 'veworld':
        // Check for VeWorld wallet
        const hasVeWorldWallet = typeof window.vechain !== 'undefined';
        if (hasVeWorldWallet) {
          console.log("[WalletDetection] VeWorld wallet detected");
        }
        return hasVeWorldWallet;
        
      case 'sync':
      case 'sync2':
      case 'thor':
        // Check for Sync2 wallet (via window.connex)
        const hasSyncWallet = typeof window.connex !== 'undefined';
        if (hasSyncWallet) {
          console.log("[WalletDetection] Sync/Thor wallet detected");
        }
        return hasSyncWallet;
        
      case 'walletconnect':
      case 'wallet-connect':
        // WalletConnect is always available as it's an external service
        return true;
        
      default:
        return false;
    }
  } catch (error) {
    console.error(`[WalletDetection] Error checking for ${type} wallet:`, error);
    return false;
  }
};

/**
 * Get available DAppKit-compatible wallets
 */
export const getAvailableWallets = () => {
  // Always include wallet-connect as it doesn't require browser extensions
  const wallets = ['wallet-connect'];
  
  // Check for VeWorld
  if (isWalletExtensionAvailable('veworld')) {
    wallets.unshift('veworld'); // Add to front of array (preferred)
  }
  
  // Check for Sync2
  if (isWalletExtensionAvailable('sync2')) {
    wallets.unshift('sync2'); // Add to front of array (preferred)
  }
  
  console.log("[WalletDetection] Available wallets:", wallets);
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
  
  // Log detected wallet environment state
  if (isBrowser()) {
    console.log("[DAppKit] Browser environment detected");
    
    if (typeof window.vechain !== 'undefined') {
      console.log("[DAppKit] VeWorld wallet is available");
      try {
        console.log("[DAppKit] VeWorld details:", {
          available: true,
          properties: Object.keys(window.vechain)
        });
      } catch (e) {
        console.error("[DAppKit] Error inspecting VeWorld:", e);
      }
    } else {
      console.log("[DAppKit] VeWorld wallet is NOT available");
    }
    
    if (typeof window.connex !== 'undefined') {
      console.log("[DAppKit] Connex/Sync wallet is available");
      try {
        console.log("[DAppKit] Connex details:", {
          available: true,
          version: window.connex.version
        });
      } catch (e) {
        console.error("[DAppKit] Error inspecting Connex:", e);
      }
    } else {
      console.log("[DAppKit] Connex/Sync wallet is NOT available");
    }
  }
  
  // Get all allowed wallet types
  // Important: Include all wallet types that could be available
  // This is critical because DAppKit won't detect wallets that aren't in the allowedWallets list
  const allowedWallets = ['veworld', 'sync2', 'wallet-connect']; 
  
  // Output a message about wallet detection
  console.log("[DAppKit] Configuring with allowed wallet types:", allowedWallets);
  
  // Configuration options
  try {
    const config = {
      nodeUrl: nodeUrl || defaultNodeUrls[networkName],
      genesis: GENESIS_IDS[networkName],
      useFirstDetectedSource: false,  // Don't auto-connect to first available wallet
      usePersistence: true,           // Remember the user's choice
      walletConnectOptions,
      logLevel: import.meta.env.DEV ? 'DEBUG' : 'ERROR',
      themeMode: 'LIGHT',
      allowedWallets
    };
    
    console.log("[DAppKit] Full configuration:", JSON.stringify(config));
    return config;
  } catch (error) {
    console.error("[DAppKit] Configuration error:", error);
    throw error; // Rethrow to allow proper error handling
  }
};