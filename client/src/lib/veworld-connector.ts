/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
 * Optimized for mobile users and enhanced error handling.
 */

import { Network, getNetwork, getNodeUrl } from './Network';
import { 
  isVeWorldMobileApp, 
  isIosDevice, 
  isAndroidDevice, 
  getVeWorldMobileInfo 
} from './veworld-mobile-detect';

// Get network definitions
const mainnetNetwork = getNetwork(Network.MAIN);
const testnetNetwork = getNetwork(Network.TEST);

// The exact genesis ID values VeWorld expects - directly from environment variables first
const GENESIS_ID_MAINNET = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || mainnetNetwork.id;
const GENESIS_ID_TESTNET = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || testnetNetwork.id;

// The exact network names VeWorld expects
const NETWORK_NAME_MAIN = 'main'; // Must be lowercase 'main'
const NETWORK_NAME_TEST = 'test'; // Must be lowercase 'test'

// Node URLs from environment variables
const NODE_URL_MAINNET = getNodeUrl(Network.MAIN);
const NODE_URL_TESTNET = getNodeUrl(Network.TEST);

// Interface for VeWorld wallet API
interface VeWorldWallet {
  readonly isVeWorld: boolean;
  readonly newConnex: (options: any) => Promise<any>;
  readonly newConnexVendor: (options: any) => Promise<any>;
  readonly newConnexSigner: (options: any) => Promise<any>;
  readonly getVendor?: () => Promise<any>;
  readonly request: (options: any) => Promise<any>;
  readonly on: (event: string, callback: Function) => void;
  readonly removeListener: (event: string, callback: Function) => void;
}

// Interface for connection result
interface VeWorldConnection {
  readonly connex: any;
  readonly vendor: any;
  readonly error?: string;
}

// Improved mobile detection
const MOBILE_USER_AGENT_REGEX = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

/**
 * Detect if running on a mobile device
 * Enhanced version that uses our specialized detection logic
 */
function isMobileDevice(): boolean {
  // First check our enhanced VeWorld-specific mobile detection
  const isVeWorldMobile = isVeWorldMobileApp();

  // If we've identified this as a VeWorld mobile app, prioritize that
  if (isVeWorldMobile) {
    console.log("VeWorldConnector: VeWorld mobile app environment detected");
    return true;
  }

  // Otherwise fall back to standard mobile detection
  if (typeof navigator === 'undefined') return false;

  const isMobileUA = MOBILE_USER_AGENT_REGEX.test(navigator.userAgent);

  // Log detailed detection info for debugging
  console.log("VeWorldConnector: Mobile detection:", {
    isVeWorldMobile,
    isMobileUA,
    isIOS: isIosDevice(),
    isAndroid: isAndroidDevice(),
    userAgent: navigator.userAgent
  });

  return isMobileUA;
}

import { Network, getNetwork, getNodeUrl } from './Network';
import { isVeWorldMobileApp } from './veworld-mobile-detect';

interface VeWorldConnection {
  connex: any;
  vendor: any;
  error?: string;
}

export async function connectVeWorld(networkType: Network): Promise<VeWorldConnection> {
  console.log(`Connecting to VeWorld with network type: ${networkType}`);

  try {
    // Get network configuration
    const network = getNetwork(networkType);
    console.log('Network configuration:', network);

    // Check if VeWorld is available
    if (typeof window === 'undefined' || !window.vechain) {
      throw new Error('VeWorld wallet not detected. Please install the VeWorld extension or app and try again.');
    }

    const vechain = window.vechain;
    if (!vechain.isVeWorld) {
      throw new Error('Not a valid VeWorld wallet');
    }

    // Enhanced details for debugging
    console.log('VeWorld details:', {
      isVeWorld: vechain.isVeWorld,
      version: vechain.version || 'unknown',
      hasNewConnex: typeof vechain.newConnex === 'function',
      hasNewConnexVendor: typeof vechain.newConnexVendor === 'function',
      availableMethods: Object.keys(vechain),
    });

    // Mobile-specific handling with improved error reporting
    if (isVeWorldMobileApp()) {
      console.log('Mobile VeWorld detected, using minimal configuration');
      try {
        // For mobile, use only the genesis parameter (no URL) to prevent potential issues
        const vendor = await vechain.newConnexVendor({
          genesis: network.id
        });

        console.log('Successfully created vendor, creating connex...');

        const connex = await vechain.newConnex({
          genesis: network.id
        });

        console.log('Successfully created connex for mobile wallet');
        return { connex, vendor };
      } catch (mobileError) {
        console.error('Mobile connection error details:', {
          error: mobileError,
          errorType: mobileError instanceof Error ? mobileError.constructor.name : 'Unknown',
          errorMessage: mobileError instanceof Error ? mobileError.message : String(mobileError),
          network: network
        });
        
        // Try alternate approach for mobile
        console.log('Trying alternate approach for mobile');
        try {
          // Use the request method format if available
          if (typeof vechain.request === 'function') {
            const connex = await vechain.request({
              method: 'newConnex',
              params: [{ genesis: network.id }]
            });
            
            const vendor = await vechain.request({
              method: 'newConnexVendor',
              params: [{ genesis: network.id }]
            });
            
            return { connex, vendor };
          }
        } catch (altError) {
          console.error('Alternate mobile approach failed:', altError);
        }
        
        throw mobileError;
      }
    }

    // Desktop connection with full configuration and better error handling
    try {
      console.log('Connecting with recommended configuration for desktop');
      const vendor = await vechain.newConnexVendor({
        genesis: network.id,
        name: network.name
      });

      console.log('Successfully created vendor, creating connex...');

      const connex = await vechain.newConnex({
        genesis: network.id,
        name: network.name
      });

      console.log('Successfully created connex for desktop wallet');
      return { connex, vendor };
    } catch (error) {
      console.error('Desktop connection error details:', {
        error,
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
        errorMessage: error instanceof Error ? error.message : String(error),
        network
      });
      
      // Try simplified approach for desktop
      console.log('Trying simplified approach for desktop');
      try {
        // Use minimal parameters
        const vendor = await vechain.newConnexVendor({
          genesis: network.id
        });
        
        const connex = await vechain.newConnex({
          genesis: network.id
        });
        
        return { connex, vendor };
      } catch (fallbackError) {
        console.error('Simplified desktop approach failed:', fallbackError);
        throw error; // Throw the original error
      }
    }
  } catch (error) {
    console.error('VeWorld connection error:', error);
    return {
      connex: null,
      vendor: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Alternative connection method with direct genesis parameter
 * This is a fallback approach that works with some VeWorld versions
 */
export async function connectVeWorldWalletAlt(networkType: Network): Promise<VeWorldConnection> {
  try {
    console.log("VeWorldConnector (Alt): Connecting to VeWorld wallet...");

    // Check if VeWorld is available
    if (typeof window === 'undefined' || !(window as any).vechain) {
      console.error("vechain object not found in window");
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }

    const vechain = (window as any).vechain as VeWorldWallet;

    if (!vechain.isVeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }

    // Determine network parameters based on type using environment variables
    const isMainNet = networkType === Network.MAIN;

    // Use environment variables if available, with hardcoded values as fallback
    const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
    const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;

    // Get genesis ID for current network
    const genesisId = isMainNet ? genesisIdMainnet : genesisIdTestnet;

    console.log("VeWorldConnector (Alt): Using direct genesis parameter:", { 
      networkType, 
      genesisId
    });

    // Try simpler parameters for mobile devices
    if (isMobileDevice()) {
      console.log("Mobile device detected in alt connection, using minimal parameters");

      try {
        // For mobile, create vendor first with minimal parameters
        const vendor = await vechain.newConnexVendor({
          genesis: genesisId
        });

        // Create a simple connex instance with minimal parameters
        const connex = await vechain.newConnex({
          genesis: genesisId
        });

        console.log("VeWorldConnector (Alt): Mobile minimal connection successful");
        return { connex, vendor };
      } catch (minimalError) {
        console.error("Minimal parameters failed:", minimalError);
        // Continue with standard alt approach
      }
    }

    // Standard alternative approach without node URL
    try {
      // Create Connex instance with just genesis parameter - avoid node URLs
      const connex = await vechain.newConnex({
        genesis: genesisId
      });

      console.log("VeWorldConnector (Alt): Connex created successfully");

      // Create vendor with direct genesis parameter
      const vendor = await vechain.newConnexVendor({
        genesis: genesisId
      });

      console.log("VeWorldConnector (Alt): Vendor created successfully");

      return { connex, vendor };
    } catch (error) {
      console.error("Standard alt approach failed:", error);
      throw error;
    }
  } catch (error) {
    console.error("VeWorldConnector (Alt) error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Ultra minimal connection attempt for problematic environments
 * This is a last resort when other approaches fail
 * 
 * Based on the research document, we'll prioritize using the wallet's
 * built-in connex instance rather than creating our own with a URL
 */
export async function connectVeWorldWalletMinimal(networkType: Network): Promise<VeWorldConnection> {
  try {
    console.log("VeWorldConnector (Minimal): Last resort connection attempt...");

    // Check if VeWorld is available
    if (typeof window === 'undefined' || !(window as any).vechain) {
      console.error("vechain object not found in window");
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }

    const vechain = (window as any).vechain as VeWorldWallet;

    if (!vechain.isVeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }

    // Determine network parameters based on type using environment variables
    const isMainNet = networkType === Network.MAIN;

    // Use environment variables if available, with hardcoded values as fallback
    const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
    const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;

    // Get genesis ID for current network
    const genesisId = isMainNet ? genesisIdMainnet : genesisIdTestnet;

    console.log("VeWorldConnector (Minimal): Using absolute minimal configuration");

    // FIRST APPROACH: Check if window.connex is available (injected by wallet)
    if (typeof window !== 'undefined' && (window as any).connex) {
      try {
        console.log("Using window.connex provided by wallet");
        const connex = (window as any).connex;

        // Try to get vendor directly
        if (typeof vechain.getVendor === 'function') {
          const vendor = await vechain.getVendor();
          if (vendor) {
            console.log("Successfully retrieved vendor from wallet");
            return { connex, vendor };
          }
        }

        // If we can't get vendor but have connex, try creating just the vendor
        console.log("Creating vendor with minimal parameters");
        const vendor = await vechain.newConnexVendor({
          genesis: genesisId
        });

        return { connex, vendor };
      } catch (e) {
        console.log("Window.connex approach failed:", e);
        // Continue to next approach
      }
    }

    // SECOND APPROACH: Try to get vendor directly without any parameters
    if (typeof vechain.getVendor === 'function') {
      try {
        console.log("Attempting direct vendor access...");
        const vendor = await vechain.getVendor();
        if (vendor && vendor.connex) {
          console.log("Successfully using vendor-provided connex");
          return { connex: vendor.connex, vendor };
        }
      } catch (e) {
        console.log("Direct vendor access failed:", e);
      }
    }

    // THIRD APPROACH: No URL method - use only genesis ID
    try {
      console.log("Trying genesis-only connection method");

      // Create vendor first with only genesis
      const vendor = await vechain.newConnexVendor({
        genesis: genesisId
      });

      console.log("Minimal vendor created");

      // Then create connex with only genesis - no node URL
      const connex = await vechain.newConnex({
        genesis: genesisId
      });

      console.log("Minimal connex created without node URL");

      return { connex, vendor };
    } catch (firstError) {
      console.error("Genesis-only connection failed:", firstError);

      // FOURTH APPROACH: Try with special format
      try {
        console.log("Trying special request format...");

        // Request format that doesn't use URL constructor internally
        const vendor = await vechain.newConnexVendor({
          genesis: genesisId,
          name: isMainNet ? "main" : "test"
        });

        const connex = await vechain.request({
          method: "newConnex", 
          params: [{
            genesis: genesisId,
            name: isMainNet ? "main" : "test" 
          }]
        });

        console.log("Special request format successful");
        return { connex, vendor };
      } catch (error) {
        console.error("All connection approaches failed:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("VeWorldConnector (Minimal) error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Comprehensive connect method that tries multiple approaches
 * This function tries different connection strategies based on device type
 */
export async function connectVeWorldWallet(networkType: Network): Promise<VeWorldConnection> {
  // Additional logging for debugging
  console.log(`Connecting to VeWorld with network type: ${networkType}`);

  // Get proper network information based on network type
  const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
  const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;
  const genesisId = networkType === Network.MAIN ? genesisIdMainnet : genesisIdTestnet;
  const networkName = networkType === Network.MAIN ? 'main' : 'test';

  console.log(`Network ID used: ${genesisId}`);
  console.log(`Network name used: ${networkName}`);
  try {
    console.log("VeWorldConnector: Connecting to VeWorld wallet...");

    // Check if VeWorld is available
    if (typeof window === 'undefined' || !(window as any).vechain) {
      console.error("vechain object not found in window");
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }

    const vechain = (window as any).vechain as VeWorldWallet;

    console.log("VeWorldConnector: API methods available:", Object.keys(vechain));

    if (!vechain.isVeWorld) {
      console.error("vechain object is not a VeWorld wallet");
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }

    // Determine network parameters based on type using environment variables
    const isMainNet = networkType === Network.MAIN;

    // Use environment variables if available, with hardcoded values as fallback
    const genesisIdMainnetEnv = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
    const genesisIdTestnetEnv = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;

    const genesisIdEnv = isMainNet ? genesisIdMainnetEnv : genesisIdTestnetEnv;
    const networkNameEnv = isMainNet ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;

    console.log("VeWorldConnector: Using genesisId:", genesisIdEnv, "for network:", networkNameEnv);
    console.log("VeWorldConnector: Connection params:", { genesisIdEnv, networkNameEnv });

    // FIRST APPROACH: Try creating vendor with minimal parameters (no URL at all)
    try {
      console.log("Approach 1: Creating vendor with genesis-only parameter");

      // Create vendor with only genesis - NO network object or URL
      const vendor = await vechain.newConnexVendor({
        genesis: genesisIdEnv
      });

      console.log("Successfully created vendor with minimal parameters");

      // Create Connex with only the required minimal parameters - NO node URL
      console.log("Creating connex with minimal parameters");
      const connex = await vechain.newConnex({
        genesis: genesisIdEnv
      });

      console.log("Successfully created connex with minimal parameters");
      return { connex, vendor };
    } catch (error) {
      console.error("Minimal approach failed:", error);

      // FALLBACK APPROACH: Try with simple name and genesis format
      try {
        console.log("Approach 2: Using simple name and genesis format");

        const vendor = await vechain.newConnexVendor({
          genesis: genesisIdEnv,
          name: networkNameEnv
        });

        const connex = await vechain.newConnex({
          genesis: genesisIdEnv,
          name: networkNameEnv
        });

        console.log("Name and genesis format successful");
        return { connex, vendor };
      } catch (error2) {
        console.error("All approaches failed:", error2);
        throw error2;
      }
    }
  } catch (error) {
    console.error("VeWorldConnector error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}