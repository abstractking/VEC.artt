/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
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
 * Connect to VeWorld wallet with precise parameters
 * This function uses the exact format expected by VeWorld
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
    
    // Use fully qualified URLs with paths as required by VeWorld
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net/" 
      : "https://testnet.veblocks.net/";
    
    console.log("VeWorldConnector: Using network parameters:", { 
      networkType, 
      genesisId, 
      networkName,
      nodeUrl 
    });
    
    // Check if VeWorld has a preferred connection method
    if (typeof vechain.getVendor === 'function') {
      console.log("Trying VeWorld's getVendor method...");
      try {
        const vendor = await vechain.getVendor();
        
        // If vendor provides its own connex instance, use that
        if (vendor.connex) {
          console.log("Using VeWorld's provided Connex instance");
          return { connex: vendor.connex, vendor };
        }
      } catch (vendorError) {
        console.log("getVendor method failed, falling back to standard approach:", vendorError);
      }
    }
    
    // Create Connex instance with exact format
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
    console.error("VeWorldConnector error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Alternative connection method that tries with direct genesis parameter
 * This is a fallback in case the nested network object doesn't work
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
    
    // Use fully qualified URLs with paths as required by VeWorld
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net/" 
      : "https://testnet.veblocks.net/";
    
    console.log("VeWorldConnector (Alt): Using direct genesis parameter:", { 
      networkType, 
      genesisId, 
      nodeUrl 
    });
    
    // Check if VeWorld has a preferred connection method
    if (typeof vechain.getVendor === 'function') {
      console.log("Trying VeWorld's getVendor method (Alt)...");
      try {
        const vendor = await vechain.getVendor();
        
        // If vendor provides its own connex instance, use that
        if (vendor.connex) {
          console.log("Using VeWorld's provided Connex instance (Alt)");
          return { connex: vendor.connex, vendor };
        }
      } catch (vendorError) {
        console.log("getVendor method failed, falling back to standard approach (Alt):", vendorError);
      }
    }
    
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
    console.error("VeWorldConnector (Alt) error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Comprehensive connect method that tries both approaches
 */
export async function connectVeWorld(networkType: Network): Promise<VeWorldConnection> {
  // Try standard method first
  const result = await connectVeWorldWallet(networkType);
  if (result.connex && result.vendor) {
    return result;
  }
  
  console.log("VeWorldConnector: Standard method failed, trying alternative...");
  
  // Try alternative method
  return connectVeWorldWalletAlt(networkType);
}