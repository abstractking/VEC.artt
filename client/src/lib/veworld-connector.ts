/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
 * Optimized for mobile users and enhanced error handling.
 */

import { Network, getNetwork, getNodeUrl } from './Network';

// Get network definitions
const mainnetNetwork = getNetwork(Network.MAIN);
const testnetNetwork = getNetwork(Network.TEST);

// The exact genesis ID values VeWorld expects
const GENESIS_ID_MAINNET = mainnetNetwork.id;
const GENESIS_ID_TESTNET = testnetNetwork.id;

// The exact network names VeWorld expects
const NETWORK_NAME_MAIN = mainnetNetwork.name;
const NETWORK_NAME_TEST = testnetNetwork.name;

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
 * This is used to adapt the connection approach for mobile
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Connect to VeWorld wallet with precise parameters
 * This function uses the exact format expected by VeWorld
 * Optimized for mobile devices with additional checks
 * 
 * Updated to use environment variables for genesis IDs and
 * completely avoid node URLs to prevent URL construction errors
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
    const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || GENESIS_ID_MAINNET;
    const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || GENESIS_ID_TESTNET;
    
    const genesisId = isMainNet ? genesisIdMainnet : genesisIdTestnet;
    const networkName = isMainNet ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;
    
    console.log("VeWorldConnector: Using genesisId:", genesisId, "for network:", networkName);
    console.log("VeWorldConnector: Connection params:", { genesisId, networkName });
    
    // FIRST APPROACH: Try creating vendor with minimal parameters (no URL at all)
    try {
      console.log("Approach 1: Creating vendor with genesis-only parameter");
      
      // Create vendor with only genesis - NO network object or URL
      const vendor = await vechain.newConnexVendor({
        genesis: genesisId
      });
      
      console.log("Successfully created vendor with minimal parameters");
      
      // Create Connex with only the required minimal parameters - NO node URL
      console.log("Creating connex with minimal parameters");
      const connex = await vechain.newConnex({
        genesis: genesisId
      });
      
      console.log("Successfully created connex with minimal parameters");
      return { connex, vendor };
    } catch (error) {
      console.error("Minimal approach failed:", error);
      
      // FALLBACK APPROACH: Try with simple name and genesis format
      try {
        console.log("Approach 2: Using simple name and genesis format");
        
        const vendor = await vechain.newConnexVendor({
          genesis: genesisId,
          name: networkName
        });
        
        const connex = await vechain.newConnex({
          genesis: genesisId,
          name: networkName
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
export async function connectVeWorld(networkType: Network): Promise<VeWorldConnection> {
  console.log("Connecting to VeWorld wallet (patched)...");
  
  // Diagnostic logging to identify available wallet objects
  console.log("Available window objects:", 
    Object.keys(window).filter(key => 
      key.toLowerCase().includes('vechain') || 
      key.toLowerCase().includes('veworld') || 
      key.toLowerCase() === 'connex'
    )
  );
  
  // Log environment variables for debugging
  console.log("Environment variables:", {
    VITE_VECHAIN_TESTNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID,
    VITE_VECHAIN_MAINNET_GENESIS_ID: import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID,
    VITE_DEPLOYMENT_ENV: import.meta.env.VITE_DEPLOYMENT_ENV,
    isNetlify: import.meta.env.VITE_DEPLOYMENT_ENV === 'netlify',
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
          
          console.log("Creating vendor with genesis only:", genesisId);
          const vendor = await vechain.newConnexVendor({
            genesis: genesisId
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