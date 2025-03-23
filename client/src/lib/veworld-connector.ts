/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
 * Optimized for mobile users and enhanced error handling.
 */

import { Network } from './Network';

// The exact genesis ID values VeWorld expects
const GENESIS_ID_MAINNET = "0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a"; // Mainnet genesis ID
const GENESIS_ID_TESTNET = "0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127"; // TestNet genesis ID per VeChain docs

// The exact network names VeWorld expects
const NETWORK_NAME_MAIN = "main";
const NETWORK_NAME_TEST = "test";

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
 */
export async function connectVeWorldWallet(networkType: Network): Promise<VeWorldConnection> {
  try {
    console.log("VeWorldConnector: Connecting to VeWorld wallet...");
    
    // Check if VeWorld is available
    if (typeof window === 'undefined' || !(window as any).VeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }
    
    const vechain = (window as any).VeWorld as VeWorldWallet;
    
    console.log("VeWorldConnector: API methods available:", Object.keys(vechain));
    
    if (!vechain.isVeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }
    
    // Determine network parameters based on type
    const isMainNet = networkType === Network.MAIN;
    const genesisId = isMainNet ? GENESIS_ID_MAINNET : GENESIS_ID_TESTNET;
    const networkName = isMainNet ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;
    
    // Use VeBlocks URLs for better compatibility - strip trailing slash
    // VeWorld mobile has issues with trailing slashes in URLs
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net" 
      : "https://testnet.veblocks.net";
    
    console.log("VeWorldConnector: Using network parameters:", { 
      networkType, 
      genesisId, 
      networkName,
      nodeUrl,
      isMobile: isMobileDevice()
    });
    
    // Check if VeWorld has a preferred connection method
    if (typeof vechain.getVendor === 'function') {
      console.log("Trying VeWorld's getVendor method...");
      try {
        const vendor = await vechain.getVendor();
        
        // If vendor provides its own connex instance, use that
        if (vendor && vendor.connex) {
          console.log("Using VeWorld's provided Connex instance");
          return { connex: vendor.connex, vendor };
        }
      } catch (vendorError) {
        console.log("getVendor method failed, falling back to standard approach:", vendorError);
      }
    }

    // Special handling for mobile devices
    if (isMobileDevice()) {
      console.log("Mobile device detected, using simplified connection parameters");
      
      // For mobile, try simpler parameters first
      try {
        // Use simplified parameters for mobile
        const vendor = await vechain.newConnexVendor({
          genesis: genesisId
        });
        
        // Create Connex instance with simplified node parameter
        const connex = await vechain.newConnex({
          node: nodeUrl,
          genesis: genesisId
        });
        
        console.log("VeWorldConnector: Mobile connection successful");
        return { connex, vendor };
      } catch (mobileError) {
        console.error("Mobile connection approach failed:", mobileError);
        // Fall through to try the standard approach
      }
    }
    
    // Create Connex instance with exact format for desktop browsers
    try {
      const connex = await vechain.newConnex({
        node: nodeUrl,
        network: {
          id: genesisId,
          name: networkName
        }
      });
      
      console.log("VeWorldConnector: Connex created successfully");
      
      // Create vendor with exact format VeWorld expects
      const vendor = await vechain.newConnexVendor({
        network: {
          id: genesisId,
          name: networkName
        }
      });
      
      console.log("VeWorldConnector: Vendor created successfully");
      
      return { connex, vendor };
    } catch (error) {
      console.error("Standard parameters failed:", error);
      throw error;
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
    if (typeof window === 'undefined' || !(window as any).VeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }
    
    const vechain = (window as any).VeWorld as VeWorldWallet;
    
    if (!vechain.isVeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }
    
    // Determine network parameters based on type
    const isMainNet = networkType === Network.MAIN;
    const genesisId = isMainNet ? GENESIS_ID_MAINNET : GENESIS_ID_TESTNET;
    
    // Use VeBlocks URLs without trailing slash
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net" 
      : "https://testnet.veblocks.net";
    
    console.log("VeWorldConnector (Alt): Using direct genesis parameter:", { 
      networkType, 
      genesisId, 
      nodeUrl 
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
    
    // Standard alternative approach with node URL
    try {
      // Create Connex instance with direct genesis parameter
      const connex = await vechain.newConnex({
        node: nodeUrl,
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
 */
export async function connectVeWorldWalletMinimal(networkType: Network): Promise<VeWorldConnection> {
  try {
    console.log("VeWorldConnector (Minimal): Last resort connection attempt...");
    
    // Check if VeWorld is available
    if (typeof window === 'undefined' || !(window as any).VeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }
    
    const vechain = (window as any).VeWorld as VeWorldWallet;
    
    if (!vechain.isVeWorld) {
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }
    
    // Determine network parameters based on type
    const isMainNet = networkType === Network.MAIN;
    const genesisId = isMainNet ? GENESIS_ID_MAINNET : GENESIS_ID_TESTNET;
    
    console.log("VeWorldConnector (Minimal): Using absolute minimal configuration");
    
    // Try to get vendor directly without any parameters
    if (typeof vechain.getVendor === 'function') {
      try {
        console.log("Attempting direct vendor access...");
        const vendor = await vechain.getVendor();
        if (vendor && vendor.connex) {
          return { connex: vendor.connex, vendor };
        }
      } catch (e) {
        console.log("Direct vendor access failed:", e);
      }
    }
    
    // Try the absolute minimal connection approach - no node URL
    try {
      console.log("Trying most minimal connection parameters possible");
      
      // Create vendor first with only genesis
      const vendor = await vechain.newConnexVendor({
        genesis: genesisId
      });
      
      console.log("Minimal vendor created");
      
      // Then create connex with only genesis
      const connex = await vechain.newConnex({
        genesis: genesisId
      });
      
      console.log("Minimal connex created");
      
      return { connex, vendor };
    } catch (error) {
      console.error("Even minimal connection failed:", error);
      throw error;
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