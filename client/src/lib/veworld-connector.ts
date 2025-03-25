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
  isVeWorld: boolean;
  newConnex: (options: any) => Promise<any>;
  newConnexVendor: (options: any) => Promise<any>;
  newConnexSigner: (options: any) => Promise<any>;
  getVendor?: () => Promise<any>; // Method to get vendor directly (may not be available in all versions)
  request: (options: any) => Promise<any>;
  on: (event: string, callback: Function) => void;
  removeListener: (event: string, callback: Function) => void;
}

// Interface for connection result
interface VeWorldConnection {
  connex: any;
  vendor: any;
  error?: string;
}

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
  
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
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

/**
 * Connect to VeWorld wallet with precise parameters
 * This function uses the exact format expected by VeWorld
 * Optimized for all device types with consistent approach
 */
export async function connectVeWorldWallet(networkType: Network): Promise<VeWorldConnection> {
  // Additional logging for debugging
  console.log(`Connecting to VeWorld with network type: ${networkType}`);
  
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
    
    // Determine network parameters - simplified to use only one approach
    const isMainNet = networkType === Network.MAIN;
    const networkName = isMainNet ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;
    
    // Log environment variables for debugging
    console.log("VeWorldConnector: Environment variables:", {
      VITE_VECHAIN_TESTNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
      VITE_VECHAIN_MAINNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
      networkType,
      networkName
    });
    
    // SIMPLIFIED APPROACH: Use the exact format that worked previously
    try {
      console.log("Creating vendor with minimal parameters (network only)");
      
      // Just use the simplest parameters that VeWorld expects - this has worked reliably
      const vendor = await vechain.newConnexVendor({
        network: networkName
      });
      
      console.log("Successfully created vendor with minimal parameters");
      
      // Attempt to create Connex only if we successfully got a vendor
      if (vendor) {
        console.log("Creating Connex with same minimal parameters");
        try {
          const connex = await vechain.newConnex({
            network: networkName
          });
          console.log("Successfully created Connex with minimal parameters");
          return { connex, vendor };
        } catch (connexError) {
          console.log("Could not create Connex, but vendor is available. Continuing with vendor only.");
          // If we can't create Connex but have vendor, that's still usable
          return { connex: null, vendor };
        }
      } else {
        throw new Error("Vendor creation returned null or undefined");
      }
    } catch (error) {
      console.error("VeWorld connection failed with minimal parameters:", error);
      
      // Provide more detailed error information
      let errorMessage = "Failed to connect to VeWorld wallet";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      } else if (error && typeof error === 'object') {
        errorMessage += `: ${JSON.stringify(error)}`;
      }
      
      throw new Error(errorMessage);
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
        // For mobile, create vendor with network name parameter (more reliable)
        const networkName = isMainNet ? 'main' : 'test';
        const vendor = await vechain.newConnexVendor({
          network: networkName
        });
        
        // Create a simple connex instance with network parameter
        const connex = await vechain.newConnex({
          network: networkName
        });
        
        console.log("VeWorldConnector (Alt): Mobile minimal connection successful");
        return { connex, vendor };
      } catch (minimalError) {
        console.error("Minimal parameters failed:", minimalError);
        // Continue with standard alt approach
      }
    }
    
    // Standard alternative approach with network name parameter
    try {
      // Use network parameter which is more reliable with VeWorld
      const networkName = isMainNet ? 'main' : 'test';
      const connex = await vechain.newConnex({
        network: networkName
      });
      
      console.log("VeWorldConnector (Alt): Connex created successfully");
      
      // Create vendor with network parameter
      const vendor = await vechain.newConnexVendor({
        network: networkName
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
        console.log("Creating vendor with network parameter");
        const networkName = isMainNet ? 'main' : 'test';
        const vendor = await vechain.newConnexVendor({
          network: networkName
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
      
      // Create vendor with network name parameter (more reliable with VeWorld)
      const networkName = isMainNet ? 'main' : 'test';
      const vendor = await vechain.newConnexVendor({
        network: networkName
      });
      
      console.log("Minimal vendor created with network parameter");
      
      // Create connex with network name parameter
      const connex = await vechain.newConnex({
        network: networkName
      });
      
      console.log("Minimal connex created without node URL");
      
      return { connex, vendor };
    } catch (firstError) {
      console.error("Genesis-only connection failed:", firstError);
      
      // FOURTH APPROACH: Try with comprehensive format including node URL
      try {
        console.log("Trying comprehensive format with node URL...");
        
        // Comprehensive format with all possible parameters
        const networkName = isMainNet ? "main" : "test";
        const nodeUrl = isMainNet ? NODE_URL_MAINNET : NODE_URL_TESTNET;
        
        const vendor = await vechain.newConnexVendor({
          network: networkName,
          node: nodeUrl
          // Removed genesis parameter to avoid conflicts
        });
        
        const connex = await vechain.request({
          method: "newConnex", 
          params: [{
            network: networkName,
            node: nodeUrl
            // Removed genesis parameter to avoid conflicts
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
export async function connectVeWorld(networkType: Network): Promise<VeWorldConnection> {
  const isMobile = isMobileDevice();
  console.log(`Connecting to VeWorld wallet (${isMobile ? 'MOBILE' : 'DESKTOP'} mode)...`);
  
  // Diagnostic logging to identify available wallet objects
  console.log("Available window objects:", 
    Object.keys(window).filter(key => 
      key.toLowerCase().includes('vechain') || 
      key.toLowerCase().includes('veworld') || 
      key.toLowerCase() === 'connex'
    )
  );
  
  // Get network parameters directly from environment variables for consistency
  const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
  const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;
  const genesisId = networkType === Network.MAIN ? genesisIdMainnet : genesisIdTestnet;
  const networkName = networkType === Network.MAIN ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;
  
  // Log environment variables and browser info for detailed debugging
  console.log("Connection parameters:", {
    networkType,
    genesisId,
    networkName,
    VITE_VECHAIN_TESTNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
    VITE_VECHAIN_MAINNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
    isMobile,
    userAgent: navigator.userAgent,
  });
  
  // FIRST APPROACH: Try to use window.connex if available (highest priority)
  if (typeof window !== 'undefined' && window.connex) {
    console.log("Found window.connex, attempting to use wallet-provided Connex instance");
    try {
      // If we have window.connex, we need to get a vendor to pair with it
      const vechain = (window as any).vechain as VeWorldWallet;
      
      if (vechain && vechain.isVeWorld) {
        // Get vendor from VeWorld
        if (typeof vechain.getVendor === 'function') {
          try {
            const vendor = await vechain.getVendor();
            if (vendor) {
              console.log("Successfully retrieved vendor and using existing connex");
              return { connex: window.connex, vendor };
            }
          } catch (e) {
            console.log("Got window.connex but failed to get vendor:", e);
          }
        }
        
        // If we can't get vendor directly, try creating just the vendor
        try {
          // Determine the right genesis ID based on network
          const isMainNet = networkType === Network.MAIN;
          const genesisId = isMainNet ? import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID : import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID;
          
          // Use network parameter which is more reliable with VeWorld
          const networkName = isMainNet ? 'main' : 'test';
          console.log("Creating vendor with network parameter:", networkName);
          const vendor = await vechain.newConnexVendor({
            network: networkName
          });
          
          console.log("Successfully created vendor to pair with existing connex");
          return { connex: window.connex, vendor };
        } catch (e) {
          console.log("Failed to create vendor to pair with window.connex:", e);
        }
      } else {
        console.log("window.connex found but no compatible vechain wallet detected");
      }
    } catch (e) {
      console.log("Error using window.connex:", e);
    }
  } else {
    console.log("window.connex not found, will try other connection methods");
  }
  
  // Check if running on mobile
  const mobile = isMobileDevice();
  
  if (mobile) {
    console.log("Mobile device detected, using mobile-optimized connection sequence");
    
    // For mobile, try minimal method first as it tends to work better on mobile
    try {
      const minimalResult = await connectVeWorldWalletMinimal(networkType);
      if (minimalResult.connex && minimalResult.vendor) {
        console.log("Minimal connection successful!");
        return minimalResult;
      }
    } catch (e) {
      console.log("Minimal approach failed:", e);
    }
    
    // Then try Alt method
    try {
      const altResult = await connectVeWorldWalletAlt(networkType);
      if (altResult.connex && altResult.vendor) {
        console.log("Alt connection successful!");
        return altResult;
      }
    } catch (e) {
      console.log("Alt approach failed:", e);
    }
    
    // Fall back to standard method
    return connectVeWorldWallet(networkType);
  } else {
    // For desktop, try standard method first
    try {
      const result = await connectVeWorldWallet(networkType);
      if (result.connex && result.vendor) {
        console.log("Standard connection successful!");
        return result;
      }
    } catch (e) {
      console.log("Standard approach failed:", e);
    }
    
    // Then try alternative method
    try {
      const altResult = await connectVeWorldWalletAlt(networkType);
      if (altResult.connex && altResult.vendor) {
        console.log("Alt connection successful!");
        return altResult;
      }
    } catch (e) {
      console.log("Alt approach failed:", e);
    }
    
    // Finally try minimal as last resort
    console.log("All standard approaches failed, trying minimal connection...");
    return connectVeWorldWalletMinimal(networkType);
  }
}