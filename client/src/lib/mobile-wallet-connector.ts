/**
 * Mobile Wallet Connector for VeChain
 * 
 * This module provides optimized connection methods specifically for mobile devices
 * with enhanced error handling and fallback strategies.
 */

import { Network, getNetwork } from './Network';
import { connectVeWorld } from './veworld-connector';

// Interface for wallet connection result
interface WalletConnectionResult {
  connex: any;
  vendor: any;
  address: string | null;
  error?: string;
}

/**
 * Detect if running on a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Check for mobile device indicators in user agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Check for touch capabilities as a secondary indicator
  const hasTouchCapability = 'ontouchstart' in window || 
                             navigator.maxTouchPoints > 0 || 
                             (navigator as any).msMaxTouchPoints > 0;
                             
  return mobileRegex.test(userAgent) || hasTouchCapability;
}

/**
 * Create a specialized mobile connection handler with automatic detection
 * and enhanced mobile-specific error handling
 */
export async function connectMobileWallet(networkType: Network = Network.TEST): Promise<WalletConnectionResult> {
  try {
    console.log('Mobile wallet connector: Attempting to connect wallet on mobile device');
    
    // On mobile, check if we're in a native wallet browser environment
    if ((window as any).ethereum || (window as any).thor || (window as any).vechain) {
      console.log('Native wallet browser environment detected!');
      
      // VeWorld wallet
      if (window.vechain && (window.vechain as any).isVeWorld) {
        console.log('VeWorld mobile wallet detected');
        
        try {
          // Use our specialized VeWorld connector with mobile optimizations
          const result = await connectVeWorld(networkType);
          
          if (result.error) {
            console.error('VeWorld mobile connection error:', result.error);
            return {
              connex: null,
              vendor: null,
              address: null,
              error: `VeWorld wallet connection failed: ${result.error}`
            };
          }
          
          // Get the wallet address
          let address = null;
          
          // Try different methods to get the wallet address
          try {
            // Method 1: Check vendor.address
            if (result.vendor && result.vendor.address) {
              address = result.vendor.address;
            }
            // Method 2: Use certificate signing
            else if (result.connex && result.connex.vendor) {
              const certificate = { 
                purpose: 'identification', 
                payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
              };
              
              const certResult = await result.connex.vendor.sign('cert', certificate).request();
              if (certResult.annex && certResult.annex.signer) {
                address = certResult.annex.signer;
              }
            }
          } catch (addressError) {
            console.warn('Could not get wallet address:', addressError);
          }
          
          return { 
            connex: result.connex, 
            vendor: result.vendor,
            address 
          };
        } catch (veWorldError) {
          console.error('VeWorld mobile connection failed:', veWorldError);
          return {
            connex: null,
            vendor: null,
            address: null,
            error: `VeWorld wallet connection failed: ${veWorldError instanceof Error ? veWorldError.message : String(veWorldError)}`
          };
        }
      }
      
      // Sync2 wallet
      if (window.connex) {
        console.log('Sync2 mobile wallet detected');
        
        try {
          // Try to use the existing connex instance
          const connex = window.connex;
          
          // Get certificate to verify wallet connection
          try {
            const certificate = { 
              purpose: 'identification', 
              payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
            };
            
            // Handle the type checking issue with the sign method
            // @ts-ignore - VeChain's Connex types are sometimes inconsistent
            const result = await connex.vendor.sign('cert', certificate).request();
            
            if (result.annex && result.annex.signer) {
              return { 
                connex, 
                vendor: connex.vendor,
                address: result.annex.signer
              };
            } else {
              return {
                connex,
                vendor: connex.vendor,
                address: null,
                error: 'No signer address returned from certificate'
              };
            }
          } catch (certError) {
            console.error('Certificate signing failed:', certError);
            return {
              connex,
              vendor: connex.vendor,
              address: null,
              error: `Certificate signing failed: ${certError instanceof Error ? certError.message : String(certError)}`
            };
          }
        } catch (syncError) {
          console.error('Sync2 mobile connection failed:', syncError);
          return {
            connex: null,
            vendor: null,
            address: null,
            error: `Sync2 wallet connection failed: ${syncError instanceof Error ? syncError.message : String(syncError)}`
          };
        }
      }
    }
    
    // No recognized wallet found in mobile environment
    return {
      connex: null,
      vendor: null,
      address: null,
      error: 'No compatible VeChain wallet found. Please install VeWorld or Sync2 wallet.'
    };
  } catch (error) {
    console.error('Mobile wallet connection error:', error);
    return {
      connex: null,
      vendor: null,
      address: null,
      error: `Wallet connection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Connect to any available wallet with mobile-first optimization
 * This function detects device type and uses the appropriate connection method
 */
export async function connectSmartWallet(networkType: Network = Network.TEST): Promise<WalletConnectionResult> {
  // Check if we're on a mobile device
  const mobile = isMobileDevice();
  console.log(`Smart wallet connector: ${mobile ? 'Mobile' : 'Desktop'} device detected`);
  
  // On mobile, use mobile-optimized connection methods
  if (mobile) {
    return connectMobileWallet(networkType);
  }
  
  // On desktop, check for wallet extensions
  try {
    // Check for Sync2
    if (window.connex) {
      console.log('Desktop Sync2 wallet detected');
      
      try {
        // Use the existing connex instance
        const connex = window.connex;
        
        // Get certificate to verify wallet connection
        const certificate = { 
          purpose: 'identification', 
          payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
        };
        
        // Handle the type checking issue with the sign method
        // @ts-ignore - VeChain's Connex types are sometimes inconsistent
        const result = await connex.vendor.sign('cert', certificate).request();
        
        if (result.annex && result.annex.signer) {
          return { 
            connex, 
            vendor: connex.vendor,
            address: result.annex.signer
          };
        } else {
          return {
            connex,
            vendor: connex.vendor,
            address: null,
            error: 'No signer address returned from certificate'
          };
        }
      } catch (certError) {
        console.error('Certificate signing failed:', certError);
        return {
          connex: window.connex,
          vendor: window.connex.vendor,
          address: null,
          error: `Certificate signing failed: ${certError instanceof Error ? certError.message : String(certError)}`
        };
      }
    }
    
    // Check for VeWorld
    if (window.vechain && (window.vechain as any).isVeWorld) {
      console.log('Desktop VeWorld wallet detected');
      
      try {
        // Use our specialized VeWorld connector
        const result = await connectVeWorld(networkType);
        
        if (result.error) {
          console.error('VeWorld connection error:', result.error);
          return {
            connex: null,
            vendor: null,
            address: null,
            error: `VeWorld wallet connection failed: ${result.error}`
          };
        }
        
        // Get the wallet address
        let address = null;
        
        // Try different methods to get the wallet address
        try {
          // Method 1: Check vendor.address
          if (result.vendor && result.vendor.address) {
            address = result.vendor.address;
          }
          // Method 2: Use certificate signing
          else if (result.connex && result.connex.vendor) {
            const certificate = { 
              purpose: 'identification', 
              payload: { type: 'text', content: 'Connect to VeCollab Marketplace' } 
            };
            
            const certResult = await result.connex.vendor.sign('cert', certificate).request();
            if (certResult.annex && certResult.annex.signer) {
              address = certResult.annex.signer;
            }
          }
        } catch (addressError) {
          console.warn('Could not get wallet address:', addressError);
        }
        
        return { 
          connex: result.connex, 
          vendor: result.vendor,
          address 
        };
      } catch (veWorldError) {
        console.error('VeWorld connection failed:', veWorldError);
        return {
          connex: null,
          vendor: null,
          address: null,
          error: `VeWorld wallet connection failed: ${veWorldError instanceof Error ? veWorldError.message : String(veWorldError)}`
        };
      }
    }
    
    // No wallet found
    return {
      connex: null,
      vendor: null,
      address: null,
      error: 'No compatible VeChain wallet found. Please install VeWorld or Sync2 wallet.'
    };
  } catch (error) {
    console.error('Smart wallet connection error:', error);
    return {
      connex: null,
      vendor: null,
      address: null,
      error: `Wallet connection error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}