/**
 * VeWorld Wallet Connector
 * 
 * This module provides a specialized connector for the VeWorld wallet
 * that directly matches the exact format expected by the VeWorld API.
 */

import { Network } from './Network';

// The exact genesis ID values VeWorld expects
const GENESIS_ID_MAINNET = "0x1"; // For mainnet, VeWorld expects 0x1
const GENESIS_ID_TESTNET = "0x00000000c05d2f87b389c15e9e8e4f7b6c88e9e8a7b384f727e431355de5b093"; // Updated TestNet genesis ID per VeChain docs

// The exact network names VeWorld expects
const NETWORK_NAME_MAIN = "main";
const NETWORK_NAME_TEST = "test";

// Interface for VeWorld wallet API
interface VeWorldWallet {
  isVeWorld: boolean;
  newConnex: (options: any) => Promise<any>;
  newConnexVendor: (options: any) => Promise<any>;
  newConnexSigner: (options: any) => Promise<any>;
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
    if (typeof window === 'undefined' || !(window as any).vechain) {
      return { 
        connex: null, 
        vendor: null, 
        error: "VeWorld wallet extension not detected"
      };
    }
    
    const vechain = (window as any).vechain as VeWorldWallet;
    
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
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net" 
      : "https://testnet.veblocks.net";
    
    console.log("VeWorldConnector: Using network parameters:", { 
      networkType, 
      genesisId, 
      networkName,
      nodeUrl 
    });
    
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
    if (typeof window === 'undefined' || !(window as any).vechain) {
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
    
    // Determine network parameters based on type
    const isMainNet = networkType === Network.MAIN;
    const genesisId = isMainNet ? GENESIS_ID_MAINNET : GENESIS_ID_TESTNET;
    const nodeUrl = isMainNet 
      ? "https://mainnet.veblocks.net" 
      : "https://testnet.veblocks.net";
    
    console.log("VeWorldConnector (Alt): Using direct genesis parameter:", { 
      networkType, 
      genesisId, 
      nodeUrl 
    });
    
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