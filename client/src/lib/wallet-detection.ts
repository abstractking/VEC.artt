/**
 * Wallet Detection Utilities for VeChain
 * 
 * This module provides utilities for detecting and verifying various VeChain wallet providers
 * and provides user-friendly error messages, with enhanced mobile detection capabilities.
 */

import { isBrowser } from './browser-info';

// Define these variables inline to avoid build problems with imports
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const isTestNet = typeof import.meta !== 'undefined' && import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'test';

// Detect if we're on a mobile device
export function isMobileDevice(): boolean {
  if (!isBrowser) return false;
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  
  // Check for mobile-specific keywords in user agent
  const mobileKeywords = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check for touch support (most mobile devices have touch support)
  const hasTouchSupport = 'ontouchstart' in window || 
                          navigator.maxTouchPoints > 0 || 
                          (navigator as any).msMaxTouchPoints > 0;
                          
  // Check screen size (most mobile devices have small screens)
  const hasSmallScreen = window.innerWidth < 768;
  
  return mobileKeywords.test(userAgent.toLowerCase()) || 
         (hasTouchSupport && hasSmallScreen);
}

// Detect if we're likely in a VeWorld mobile app web view
export function isInVeWorldMobileApp(): boolean {
  if (!isBrowser) return false;
  
  // Check for VeWorld mobile app specific indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const hasVeWorldObject = typeof (window as any).vechain !== 'undefined' && 
                           (window as any).vechain.isVeWorld === true;
                           
  // Check for webview/capacitor keywords that might indicate a mobile app webview
  const isWebView = userAgent.includes('wv') || 
                    userAgent.includes('capacitor') || 
                    (document as any).documentElement.classList.contains('veworld-app');
                    
  return hasVeWorldObject && isMobileDevice() && isWebView;
}

/**
 * Available VeChain wallet types
 */
// DApp Kit uses 'wallet-connect', but our internal API uses 'walletconnect'
export type VeChainWalletType = 'veworld' | 'thor' | 'sync' | 'sync2' | 'environment' | 'walletconnect' | 'wallet-connect';

/**
 * Result from wallet detection
 */
export interface WalletDetectionResult {
  available: boolean;
  installed: boolean;
  walletType: VeChainWalletType | null;
  message: string;
}

/**
 * Checks if the Thor wallet extension is available
 */
export function isThorWalletAvailable(): boolean {
  if (!isBrowser) return false;
  return typeof (window as any).thor !== 'undefined';
}

/**
 * Checks if the VeWorld wallet extension is available
 */
export function isVeWorldWalletAvailable(): boolean {
  if (!isBrowser) return false;
  return typeof (window as any).vechain !== 'undefined';
}

/**
 * Detects which wallets are available in the current browser environment
 * Returns an array of available wallet types, with mobile-aware detection
 */
export function detectAvailableWallets(): VeChainWalletType[] {
  const availableWallets: VeChainWalletType[] = [];
  const isMobile = isMobileDevice();
  
  // Check for VeWorld (works on mobile and desktop)
  if (isVeWorldWalletAvailable()) {
    availableWallets.push('veworld');
  }
  
  // Check for Thor (primarily desktop browser)
  if (isThorWalletAvailable()) {
    availableWallets.push('thor');
  }
  
  // Check for window.connex - could be from Sync or Sync2
  const hasConnex = typeof window !== 'undefined' && window.connex !== undefined;
  
  // Only include desktop apps if we're not on a mobile device
  if (!isMobile) {
    // Always include Sync and Sync2 for testing purposes
    // Even if window.connex isn't detected yet
    availableWallets.push('sync2');
    availableWallets.push('sync');
  }
  
  // In development, also include environment key option
  if (!isNetlify) {
    availableWallets.push('environment');
  }
  
  // Consider mobile-specific options
  if (isMobile) {
    // WalletConnect is now implemented and perfect for mobile
    availableWallets.push('walletconnect');
    
    // If in VeWorld mobile app, prioritize it
    if (isInVeWorldMobileApp()) {
      // Ensure veworld is at the top of the list
      if (!availableWallets.includes('veworld')) {
        availableWallets.unshift('veworld');
      }
    }
  } else {
    // Desktop users can also use WalletConnect to connect to their mobile wallets
    availableWallets.push('walletconnect');
  }
  
  return availableWallets;
}

/**
 * Attempts to detect the most appropriate wallet to use
 * based on available extensions or options, with mobile optimization
 */
export function detectBestWalletOption(): VeChainWalletType {
  const available = detectAvailableWallets();
  const isMobile = isMobileDevice();
  
  // Special case for VeWorld mobile app
  if (isInVeWorldMobileApp() && available.includes('veworld')) {
    return 'veworld';
  }
  
  // On mobile, prioritize wallet options that work well on mobile
  if (isMobile) {
    // VeWorld works well on mobile
    if (available.includes('veworld')) {
      return 'veworld';
    }
    
    // WalletConnect is now implemented and works well for mobile
    if (available.includes('walletconnect')) {
      return 'walletconnect';
    }
    
    // Thor can sometimes work on mobile
    if (available.includes('thor')) {
      return 'thor';
    }
  } else {
    // On desktop, prioritize browser extensions over desktop apps
    if (available.includes('veworld')) {
      return 'veworld';
    }
    
    if (available.includes('thor')) {
      return 'thor';
    }
    
    // Then try desktop options
    if (available.includes('sync2')) {
      return 'sync2';
    }
    
    if (available.includes('sync')) {
      return 'sync';
    }
    
    // WalletConnect is also available for desktop users
    if (available.includes('walletconnect')) {
      return 'walletconnect';
    }
  }
  
  // Fallback to environment keys in development
  if (available.includes('environment')) {
    return 'environment';
  }
  
  // Default to veworld which is most widely supported
  return 'veworld';
}

/**
 * Verifies if the specified wallet type is available
 * and returns detailed information
 */
export function verifyWalletAvailability(walletType: VeChainWalletType): WalletDetectionResult {
  const isMobile = isMobileDevice();
  const isVeWorldMobile = isInVeWorldMobileApp();

  switch (walletType) {
    case 'veworld': {
      const veWorldAvailable = isVeWorldWalletAvailable();
      let message = "";
      
      if (veWorldAvailable) {
        message = isVeWorldMobile 
          ? "VeWorld mobile app detected" 
          : "VeWorld wallet detected";
      } else {
        if (isMobile) {
          message = "VeWorld wallet not detected. Please open this page in the VeWorld mobile app or install the VeWorld browser extension.";
        } else {
          message = "VeWorld wallet extension not detected. Please install the VeWorld extension for your browser, configure it for TestNet, and try again.";
        }
      }
      
      return {
        available: veWorldAvailable,
        installed: veWorldAvailable,
        walletType: 'veworld',
        message
      };
    }
      
    case 'thor': {
      const thorAvailable = isThorWalletAvailable();
      let message = "";
      
      if (thorAvailable) {
        message = "VeChainThor wallet detected";
      } else {
        if (isMobile) {
          message = "VeChainThor wallet not supported on most mobile browsers. We recommend using VeWorld mobile app instead.";
        } else {
          message = "VeChainThor wallet extension not detected. Please install the VeChainThor wallet extension, configure it for TestNet, and try again.";
        }
      }
      
      return {
        available: thorAvailable,
        installed: thorAvailable,
        walletType: 'thor',
        message
      };
    }
      
    case 'sync': {
      // For desktop apps like Sync, we can check for window.connex
      // as an indicator that it's connected/running
      const syncConnexAvailable = typeof window !== 'undefined' && window.connex !== undefined;
      // But we should discourage mobile users from trying to use desktop apps
      // For testing, we'll make it available on desktop even if not detected
      const available = !isMobile; 
      
      return {
        available, // Available for testing on desktop
        installed: syncConnexAvailable, // If connex exists, it might be from Sync
        walletType: 'sync',
        message: isMobile
          ? "Sync is a desktop application and not compatible with mobile devices. Please use VeWorld mobile app instead."
          : syncConnexAvailable 
            ? "Sync wallet detected and available for connection."
            : "Sync wallet not detected but you can try connecting. Please ensure Sync desktop application is installed and running."
      };
    }
      
    case 'sync2': {
      // For Sync2, we can check for window.connex as an indicator
      // that it's connected/running
      const sync2ConnexAvailable = typeof window !== 'undefined' && window.connex !== undefined;
      // But we should discourage mobile users from trying to use desktop apps
      // For testing, we'll make it available on desktop even if not detected
      const available = !isMobile;
      
      return {
        available, // Available for testing on desktop
        installed: sync2ConnexAvailable, // If connex exists, it might be from Sync2
        walletType: 'sync2',
        message: isMobile
          ? "Sync2 is a desktop application and not compatible with mobile devices. Please use VeWorld mobile app instead."
          : sync2ConnexAvailable 
            ? "Sync2 wallet detected and available for connection."
            : "Sync2 wallet not detected but you can try connecting. Please ensure Sync2 is installed and running."
      };
    }
      
    case 'environment': {
      const hasEnvKey = !!import.meta.env.VITE_VECHAIN_PRIVATE_KEY;
      const envKeyAvailable = !isNetlify && hasEnvKey;
      
      return {
        available: !!envKeyAvailable,
        installed: !!envKeyAvailable,
        walletType: 'environment',
        message: envKeyAvailable 
          ? "Environment key available for development use"
          : "No environment key available. This option is only available in development mode."
      };
    }
      
    case 'walletconnect':
    case 'wallet-connect': {
      // WalletConnect is now fully implemented
      return {
        available: true, // Always available
        installed: true, // No installation needed
        walletType: 'walletconnect',
        message: isMobile
          ? "WalletConnect allows you to connect your mobile wallet by scanning a QR code."
          : "WalletConnect allows you to connect via a QR code scanned with your mobile wallet."
      };
    }
      
    default:
      return {
        available: false,
        installed: false,
        walletType: null,
        message: "Unknown wallet type specified"
      };
  }
}

/**
 * Check if we're in TestNet mode and validate the wallet availability
 */
export function validateWalletForNetwork(walletType: VeChainWalletType): WalletDetectionResult {
  const walletInfo = verifyWalletAvailability(walletType);
  
  if (isNetlify && isTestNet) {
    // On Netlify with TestNet, ensure we have a valid wallet
    if (!walletInfo.available && walletType !== 'sync' && walletType !== 'sync2') {
      return {
        ...walletInfo,
        message: `${walletInfo.message} TestNet is required for this application.`
      };
    }
  }
  
  return walletInfo;
}

/**
 * Gets user-friendly wallet name for display
 */
export function getWalletDisplayName(walletType: VeChainWalletType): string {
  switch (walletType) {
    case 'veworld': return 'VeWorld';
    case 'thor': return 'VeChainThor';
    case 'sync': return 'Sync';
    case 'sync2': return 'Sync2';
    case 'environment': return 'Development Key';
    case 'walletconnect': 
    case 'wallet-connect': return 'WalletConnect';
    default: return 'Unknown Wallet';
  }
}