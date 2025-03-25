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
  newConnexSigner?: (options: any) => Promise<any>;
  getVendor?: () => Promise<any>; // Method to get vendor directly (may not be available in all versions)
  request: (options: any) => Promise<any>;
  on?: (event: string, callback: Function) => void;
  removeListener?: (event: string, callback: Function) => void;
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
 * Simple VeWorld connection with minimalist approach
 * Uses only the essential parameters for highest compatibility
 */
export async function connectVeWorld(networkType: Network): Promise<VeWorldConnection> {
  const isMobile = isMobileDevice();
  console.log(`Connecting to VeWorld with network type: ${networkType} (${isMobile ? 'MOBILE' : 'DESKTOP'} mode)`);
  
  try {
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
      console.error("vechain object is not a VeWorld wallet");
      return { 
        connex: null, 
        vendor: null, 
        error: "Not a valid VeWorld wallet extension"
      };
    }
    
    // Determine network parameters
    const isMainNet = networkType === Network.MAIN;
    const networkName = isMainNet ? NETWORK_NAME_MAIN : NETWORK_NAME_TEST;
    const nodeUrl = isMainNet ? NODE_URL_MAINNET : NODE_URL_TESTNET;
    
    console.log("VeWorld connection parameters:", {
      networkType,
      networkName,
      nodeUrl,
      isMobile
    });
    
    // SUPER SIMPLE APPROACH: Use the most reliable parameters for VeWorld
    // We've found that 'network' parameter alone is the most consistently supported
    // across all VeWorld versions and platforms
    
    console.log("Using streamlined VeWorld connection approach");
    try {
      // 1. Try to create vendor with network parameter only
      console.log("Creating vendor with network parameter only");
      const vendor = await vechain.newConnexVendor({
        network: networkName
      });
      
      console.log("Successfully created vendor");
      
      // 2. Try to create connex with network parameter only
      try {
        console.log("Creating connex with network parameter only");
        const connex = await vechain.newConnex({
          network: networkName
        });
        
        console.log("Successfully created connex");
        return { connex, vendor };
      } catch (connexError) {
        console.log("Failed to create connex with network only:", connexError);
        
        // 3. If that fails, try with network+node parameters
        try {
          console.log("Creating connex with network+node parameters");
          const connex = await vechain.newConnex({
            network: networkName,
            node: nodeUrl
          });
          
          console.log("Successfully created connex with network+node parameters");
          return { connex, vendor };
        } catch (secondConnexError) {
          console.log("Failed to create connex with network+node:", secondConnexError);
          
          // 4. If connex creation still fails, check if we can use window.connex
          if (window.connex) {
            console.log("Using existing window.connex with our vendor");
            return { connex: window.connex, vendor };
          }
          
          // 5. If all connex creation attempts fail, continue with vendor only
          console.log("Could not create connex, continuing with vendor only");
          return { connex: null, vendor };
        }
      }
    } catch (vendorError) {
      console.error("Failed to create vendor with network parameter:", vendorError);
      
      // If standard vendor creation fails, try special mobile approach
      if (isMobile) {
        console.log("Mobile device detected, trying specialized mobile approach");
        try {
          // Some mobile VeWorld versions respond differently - try again with just network
          const vendor = await vechain.newConnexVendor({
            network: networkName
          });
          
          // Try using window.connex if available
          if (window.connex) {
            console.log("Using existing window.connex for mobile");
            return { connex: window.connex, vendor };
          }
          
          console.log("Mobile vendor created but no connex available");
          return { connex: null, vendor };
        } catch (mobileError) {
          console.error("Mobile approach also failed:", mobileError);
        }
      }
      
      // Last resort: try using existing window.connex if available
      if (window.connex) {
        console.log("Attempting to use existing window.connex as fallback");
        try {
          // Create a type-safe vendor that mimics Connex vendor
          const simpleVendor = {
            sign: function(type: "tx" | "cert", message: any) {
              if (!window.connex || !window.connex.vendor) {
                throw new Error("No vendor available in window.connex");
              }
              
              // Pass through to the real vendor but with the right typing
              if (type === "tx") {
                return window.connex.vendor.sign("tx", message);
              } else {
                return window.connex.vendor.sign("cert", message);
              }
            }
          };
          
          return { connex: window.connex, vendor: simpleVendor };
        } catch (fallbackError) {
          console.error("Failed to create simple vendor:", fallbackError);
        }
      }
      
      // Nothing worked
      return {
        connex: null,
        vendor: null,
        error: "Failed to connect to VeWorld wallet after multiple attempts. Please check if the wallet is installed and unlocked."
      };
    }
  } catch (error) {
    console.error("VeWorld connection error:", error);
    return { 
      connex: null, 
      vendor: null, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export functions and types
export {
  VeWorldWallet,
  VeWorldConnection,
  isMobileDevice
};