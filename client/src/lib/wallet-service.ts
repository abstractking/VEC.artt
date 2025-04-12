/**
 * Unified Wallet Service
 * 
 * This module serves as the central wallet connection implementation for the application,
 * consolidating functionality previously duplicated across multiple files. It handles:
 * 
 * 1. Wallet detection using wallet-detection.ts
 * 2. Wallet connection through a unified API
 * 3. Environment-specific behavior (dev, production, Netlify)
 * 4. Proper error handling and recovery
 */

import { 
  VeChainWalletType, 
  detectAvailableWallets, 
  detectBestWalletOption,
  isVeWorldWalletAvailable,
  isThorWalletAvailable
} from './wallet-detection';
import { Framework } from '@vechain/connex-framework';
import { Driver, SimpleWallet } from '@vechain/connex-driver';
import { BrowserNet } from './browser-net';
import { Network, NETWORKS as NETWORK_DESCRIPTORS } from './Network';

// For type definitions
import type Connex from '@vechain/connex';

// Define custom interfaces for wallet providers
interface VeWorldWallet {
  isVeWorld: boolean;
  newConnex: (options: any) => Promise<any>;
  newConnexVendor: (options: any) => Promise<any>;
  request: (args: { method: string, params?: any[] }) => Promise<any>;
}

interface ConnexType {
  thor: any;
  vendor: any;
}

// Declare global window extensions for wallet providers
declare global {
  interface Window {
    veworld?: VeWorldWallet;
    vechain?: VeWorldWallet;
    thor?: any;
    connex?: ConnexType;
    cryptoPolyfill?: any;
  }
}

// Detect environment
const isDevelopment = 
  typeof window !== 'undefined' && (
    window.location.hostname.includes('replit') || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV === true ||
    window.location.href.includes('localhost') ||
    window.location.href.includes('.app.github.dev') ||
    window.location.href.includes('127.0.0.1')
  );

const isNetlify = 
  typeof window !== 'undefined' && 
  window.location.hostname.includes('netlify.app');

// Interface for VeChain provider detection
interface VechainProvider {
  request: (args: { method: string, params?: any[] }) => Promise<any>
}

// Result from wallet connection
export interface WalletConnectionResult {
  connex: Connex | null;
  vendor: any | null;
  address: string | null;
  name: string;
  isConnected: boolean;
  error?: string;
}

// Detect VeChain provider (VeWorld or other compatible wallet)
export const detectVechainProvider = async (): Promise<VechainProvider> => {
  if (typeof window === 'undefined') {
    throw new Error('Window is undefined - are you server-side?');
  }

  // Check for VeWorld
  if (window.veworld) {
    console.log('[WalletService] Detected VeWorld provider');
    return window.veworld;
  }

  // Check for legacy provider
  if (window.vechain) {
    console.log('[WalletService] Detected legacy VeChain provider');
    return window.vechain;
  }

  // Wait for window load if providers not immediately available
  return new Promise((resolve, reject) => {
    if (document.readyState === 'complete') {
      checkProvidersAndResolve();
    } else {
      window.addEventListener('load', () => {
        checkProvidersAndResolve();
      });
    }

    function checkProvidersAndResolve() {
      if (window.veworld) {
        console.log('[WalletService] Detected VeWorld provider (on load)');
        resolve(window.veworld);
      } else if (window.vechain) {
        console.log('[WalletService] Detected legacy VeChain provider (on load)');
        resolve(window.vechain);
      } else {
        reject(new Error('VeChain wallet provider not found. Please install VeWorld.'));
      }
    }
  });
};

// Get the selected network
export const getNetwork = () => {
  const selectedNetwork = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK || 'test';
  const networks = {
    main: {
      url: 'https://mainnet.veblocks.net',
      socketUrl: 'wss://mainnet.veblocks.net',
      chainId: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
      genesisId: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
      name: 'MainNet',
    },
    test: {
      url: 'https://testnet.veblocks.net',
      socketUrl: 'wss://testnet.veblocks.net',
      chainId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
      genesisId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
      name: 'TestNet',
    }
  };

  return networks[selectedNetwork as keyof typeof networks] || networks.test;
};

// Initialize Connex (VeChain blockchain interface)
export const initializeConnex = async (): Promise<Connex> => {
  try {
    const network = getNetwork();
    
    // Check if we're in development environment
    if (isDevelopment) {
      console.log("Development environment detected - using HTTP polling for VeChain connection");
      
      // Check if we have a private key for development environment
      const privateKey = import.meta.env.VITE_VECHAIN_PRIVATE_KEY;
      
      if (privateKey) {
        // Create a wallet with the private key
        const wallet = new SimpleWallet();
        wallet.import(privateKey);
        
        // Create a driver with our wallet
        const net = new BrowserNet(network.url);
        const driver = await Driver.connect(net, wallet);
        return new Framework(driver);
      } else {
        // Regular connection without a wallet
        const net = new BrowserNet(network.url);
        const driver = await Driver.connect(net);
        return new Framework(driver);
      }
    }
    
    // For production: Try WebSocket first, then fall back to HTTP
    try {
      // WebSocket URL
      const wsUrl = network.socketUrl || 
                   (network.name.toLowerCase() === 'main' 
                     ? 'wss://mainnet.veblocks.net'
                     : 'wss://testnet.veblocks.net');
                     
      console.log("Attempting WebSocket connection to:", wsUrl);
      const wsDriver = await Driver.connect(new BrowserNet(wsUrl));
      console.log("WebSocket driver connected successfully");
      
      return new Framework(wsDriver);
    } catch (wsError) {
      console.warn("WebSocket connection failed, falling back to HTTP:", wsError);
      
      // Fall back to HTTP
      console.log("Attempting HTTP fallback connection to:", network.url);
      const driver = await Driver.connect(new BrowserNet(network.url));
      console.log("HTTP driver connected successfully");
      
      return new Framework(driver);
    }
  } catch (error) {
    console.error('Failed to initialize Connex:', error);
    throw error;
  }
};

// Create a development wallet for testing
const createDevelopmentWallet = async (): Promise<WalletConnectionResult> => {
  try {
    // Development test address
    const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
    
    // For Netlify or dev environments, try to return a usable Connex instance
    const connex = await initializeConnex();
    
    return {
      connex,
      vendor: null, // No real vendor in development 
      address: testAddress,
      name: isNetlify ? 'Netlify Demo Wallet' : 'Development Wallet',
      isConnected: true
    };
  } catch (error) {
    console.error("Error creating development wallet:", error);
    
    // Still return a working wallet for development
    return {
      connex: null,
      vendor: null,
      address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
      name: 'Demo Wallet (Error Recovery)',
      isConnected: true
    };
  }
};

// Connect to a wallet with specific wallet type
// Extended wallet type to include 'auto' option
export type ExtendedWalletType = VeChainWalletType | 'auto';

export const connectWallet = async (walletType: ExtendedWalletType = 'veworld'): Promise<WalletConnectionResult> => {
  // If auto mode, detect the best wallet to use
  if (walletType === 'auto') {
    walletType = detectBestWalletOption();
  }
  
  console.log(`[WalletService] Connecting to ${walletType} wallet...`);
  
  try {
    // For development or Netlify environments, use a test wallet
    if ((isDevelopment || isNetlify) && 
        (walletType === 'environment' || import.meta.env.VITE_FORCE_DEV_WALLET === 'true')) {
      console.log("[WalletService] Using development wallet");
      return createDevelopmentWallet();
    }
    
    // Handle different wallet types with standardized approach
    switch(walletType) {
      case 'veworld':
        return connectVeWorldWallet();
        
      case 'thor':
        return connectThorWallet();
        
      case 'sync':
      case 'sync2':
        return connectSyncWallet(walletType);
        
      case 'walletconnect':
      case 'wallet-connect':
        return connectWalletConnect();
        
      case 'environment':
        // This case is only for explicit environment wallet connections
        return createDevelopmentWallet();
        
      default:
        throw new Error(`Unsupported wallet type: ${walletType}`);
    }
  } catch (error: any) {
    console.error("[WalletService] Wallet connection error:", error);
    
    // For development or demo environments, still provide a working wallet
    if (isDevelopment || isNetlify) {
      console.log("[WalletService] Returning development wallet due to error");
      return createDevelopmentWallet();
    }
    
    // Return error state for production
    return {
      connex: null,
      vendor: null,
      address: null,
      name: 'Connection Failed',
      isConnected: false,
      error: error.message || 'Unknown error connecting to wallet'
    };
  }
};

// Implementation for VeWorld wallet connection
async function connectVeWorldWallet(): Promise<WalletConnectionResult> {
  if (!isVeWorldWalletAvailable()) {
    throw new Error("VeWorld wallet extension not detected. Please install VeWorld extension and try again.");
  }
  
  try {
    console.log("[WalletService] Connecting to VeWorld wallet...");
    
    // Use lowercase 'vechain' as that's how VeWorld injects itself
    const vechain = window.vechain;
    
    if (!vechain || !vechain.isVeWorld) {
      throw new Error("Not a valid VeWorld wallet extension");
    }
    
    // Get network parameters
    const network = getNetwork();
    const networkName = network.name.toLowerCase();
    const networkType = networkName.includes('main') ? Network.MAIN : Network.TEST;
    const networkDescriptor = NETWORK_DESCRIPTORS[networkType];
    
    if (!networkDescriptor || !networkDescriptor.id) {
      throw new Error('Invalid network configuration');
    }
    
    const genesisId = networkDescriptor.id;
    
    console.log("[WalletService] VeWorld network parameters:", {
      networkType,
      genesisId,
      networkName: networkDescriptor.name
    });
    
    // Create VeWorld vendor and Connex instance
    if (typeof vechain.newConnex === 'function' && typeof vechain.newConnexVendor === 'function') {
      let vendor = null;
      let connex = null;
      let maxRetries = 2;
      let retryCount = 0;
      
      while (retryCount <= maxRetries) {
        try {
          // Create vendor with exact parameters VeWorld expects
          console.log(`[WalletService] Attempt ${retryCount + 1}: Creating VeWorld vendor`);
          vendor = await vechain.newConnexVendor({
            genesis: genesisId,
            name: network.name.toLowerCase()
          });
          
          if (!vendor) {
            throw new Error('VeWorld vendor creation failed');
          }
          
          // Create Connex with minimal parameters
          console.log(`[WalletService] Attempt ${retryCount + 1}: Creating VeWorld Connex`);
          connex = await vechain.newConnex({
            genesis: genesisId
          });
          
          console.log("[WalletService] VeWorld connection successful!");
          break;
        } catch (retryError) {
          retryCount++;
          console.warn(`[WalletService] Connection attempt ${retryCount} failed:`, retryError);
          
          if (retryCount > maxRetries) {
            throw retryError;
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Get the wallet address
      const provider = await detectVechainProvider().catch(() => null);
      let address = null;
      
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          address = accounts[0];
        }
      }
      
      // Get address from other methods if provider method failed
      if (!address && vendor) {
        // Get from any custom property the vendor might have
        if ('signer' in vendor) {
          address = (vendor as any).signer;
        } else if ('address' in vendor) {
          address = (vendor as any).address;
        }
      }
      
      return { 
        connex, 
        vendor,
        address,
        name: 'VeWorld',
        isConnected: !!connex && !!vendor
      };
    }
    
    throw new Error("VeWorld wallet is missing required APIs");
  } catch (error: any) {
    console.error("[WalletService] VeWorld connection error:", error);
    throw error;
  }
}

// Implementation for Thor wallet connection
async function connectThorWallet(): Promise<WalletConnectionResult> {
  if (!isThorWalletAvailable()) {
    throw new Error("VeChainThor wallet extension not detected");
  }
  
  try {
    console.log("[WalletService] Connecting to Thor wallet...");
    const thor = window.thor;
    
    // Enable the wallet which returns a vendor object
    const vendor = await thor.enable();
    console.log("[WalletService] Thor wallet enabled");
    
    // Get address
    let address = null;
    if (vendor && vendor.address) {
      address = vendor.address;
    }
    
    // Check if we have window.connex available
    if (window.connex) {
      return { 
        connex: window.connex, 
        vendor,
        address,
        name: 'VeChainThor',
        isConnected: true
      };
    }
    
    // Fallback to creating our own connex instance
    const connex = await initializeConnex();
    return { 
      connex, 
      vendor,
      address,
      name: 'VeChainThor',
      isConnected: true
    };
  } catch (error) {
    console.error("[WalletService] Thor wallet connection error:", error);
    throw error;
  }
}

// Implementation for Sync/Sync2 wallet connections
async function connectSyncWallet(type: 'sync' | 'sync2'): Promise<WalletConnectionResult> {
  try {
    console.log(`[WalletService] Connecting to ${type} wallet...`);
    
    // Try to detect if Sync is installed by looking for window.connex
    if (!window.connex) {
      throw new Error(`${type} wallet not detected or not accessible`);
    }
    
    // Try to create a certificate to identify the wallet
    try {
      // Define a properly typed request
      type CertMessage = {
        purpose: 'identification' | 'agreement';
        payload: {
          type: 'text';
          content: string;
        }
      };
      
      // Create the certificate message with proper typing
      const certMessage: CertMessage = {
        purpose: 'identification',
        payload: {
          type: 'text',
          content: `Connecting to VeCollab with ${type}`
        }
      };
      
      const certResult = await window.connex.vendor.sign('cert', certMessage).request();
      console.log("[WalletService] Wallet certificate response:", certResult);
      
      // Get address from certificate if possible
      let address = null;
      if (certResult && certResult.annex && certResult.annex.signer) {
        address = certResult.annex.signer;
      }
      
      // If we get a result, we have a compatible wallet
      return {
        connex: window.connex,
        vendor: window.connex.vendor,
        address,
        name: type === 'sync' ? 'Sync' : 'Sync2',
        isConnected: true
      };
    } catch (certError) {
      console.error(`[WalletService] Certificate creation failed for ${type}:`, certError);
      throw new Error(`${type} wallet connection rejected`);
    }
  } catch (error) {
    console.error(`[WalletService] ${type} wallet connection error:`, error);
    throw error;
  }
}

// Implementation for WalletConnect connections
async function connectWalletConnect(): Promise<WalletConnectionResult> {
  try {
    console.log("[WalletService] Initializing WalletConnect...");
    
    // For now, create a standard Connex instance
    // Full WalletConnect integration would be implemented here
    const connex = await initializeConnex();
    
    return {
      connex,
      vendor: {
        name: 'WalletConnect',
        address: null
      },
      address: null,
      name: 'WalletConnect',
      isConnected: true,
      error: "Full WalletConnect integration not implemented. Use DApp Kit for WalletConnect integration."
    };
  } catch (error) {
    console.error("[WalletService] WalletConnect error:", error);
    throw error;
  }
}

// Check if user has an existing wallet connection
export const checkExistingConnection = async (): Promise<WalletConnectionResult | null> => {
  // Check local storage for persisted connection
  const isConnected = localStorage.getItem('vechain_connected') === 'true';
  const storedAddress = localStorage.getItem('vechain_address');
  const storedWalletType = localStorage.getItem('vechain_wallet_type') as VeChainWalletType || 'veworld';
  
  if (!isConnected || !storedAddress) {
    return null;
  }
  
  // In development or Netlify, just restore the saved connection
  if (isDevelopment || isNetlify) {
    console.log(`[WalletService] Restoring development wallet connection`);
    return createDevelopmentWallet();
  }
  
  // For production, verify the connection with the actual wallet
  try {
    // For most wallet types, verify with provider
    if (['veworld', 'thor'].includes(storedWalletType)) {
      const provider = await detectVechainProvider().catch(() => null);
      
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          // Check if the stored address matches one of the accounts
          if (accounts.some((acc: string) => acc.toLowerCase() === storedAddress.toLowerCase())) {
            console.log(`[WalletService] Restored wallet connection with address: ${accounts[0]}`);
            
            // Reconnect with the wallet type to get fresh connex instance
            return connectWallet(storedWalletType);
          }
        }
      }
    }
    
    // For Sync wallets, check if connex is available
    if (['sync', 'sync2'].includes(storedWalletType) && window.connex) {
      console.log(`[WalletService] Restoring ${storedWalletType} connection`);
      return connectWallet(storedWalletType as 'sync' | 'sync2');
    }
  } catch (error) {
    console.error("[WalletService] Error checking existing connection:", error);
  }
  
  // If we couldn't restore, return null
  return null;
};

// Save wallet connection
export const saveWalletConnection = (result: WalletConnectionResult, walletType: VeChainWalletType): void => {
  if (result.isConnected && result.address) {
    localStorage.setItem('vechain_connected', 'true');
    localStorage.setItem('vechain_address', result.address);
    localStorage.setItem('vechain_wallet_type', walletType);
  }
};

// Clear wallet connection
export const clearWalletConnection = (): void => {
  localStorage.removeItem('vechain_connected');
  localStorage.removeItem('vechain_address');
  localStorage.removeItem('vechain_wallet_type');
};