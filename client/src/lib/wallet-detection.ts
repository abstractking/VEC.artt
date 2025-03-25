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
export type VeChainWalletType = 'veworld' | 'thor' | 'sync' | 'sync2' | 'environment' | 'walletconnect';

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
  
  // Only include desktop apps if we're not on a mobile device
  if (!isMobile) {
    availableWallets.push('sync');
    availableWallets.push('sync2');
  }
  
  // In development, also include environment key option
  if (!isNetlify) {
    availableWallets.push('environment');
  }
  
  // Consider mobile-specific options
  if (isMobile) {
    // WalletConnect would be perfect for mobile, but it's not yet implemented
    // availableWallets.push('walletconnect');
    
    // If in VeWorld mobile app, prioritize it
    if (isInVeWorldMobileApp()) {
      // Ensure veworld is at the top of the list
      if (!availableWallets.includes('veworld')) {
        availableWallets.unshift('veworld');
      }
    }
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
    
    // WalletConnect would be good for mobile but it's not implemented yet
    // if (available.includes('walletconnect')) {
    //   return 'walletconnect';
    // }
    
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
      // For desktop apps, we can't detect if they are installed
      // But we should discourage mobile users from trying to use desktop apps
      const available = !isMobile;
      
      return {
        available, // Not available on mobile
        installed: false, // We don't know if it's installed
        walletType: 'sync',
        message: isMobile
          ? "Sync is a desktop application and not compatible with mobile devices. Please use VeWorld mobile app instead."
          : "Please ensure Sync desktop application is installed and running."
      };
    }
      
    case 'sync2': {
      // For desktop apps, we can't detect if they are installed
      // But we should discourage mobile users from trying to use desktop apps
      const available = !isMobile;
      
      return {
        available, // Not available on mobile
        installed: false, // We don't know if it's installed
        walletType: 'sync2',
        message: isMobile
          ? "Sync2 is a desktop application and not compatible with mobile devices. Please use VeWorld mobile app instead."
          : "Please ensure Sync2 desktop application is installed and running."
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
      
    case 'walletconnect': {
      // WalletConnect is not yet fully implemented
      return {
        available: false, // Set to false until fully implemented
        installed: false,
        walletType: 'walletconnect',
        message: isMobile
          ? "WalletConnect integration is coming soon. This will provide an easy way to connect your mobile wallet."
          : "WalletConnect integration is coming soon."
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
    case 'walletconnect': return 'WalletConnect';
    default: return 'Unknown Wallet';
  }
}