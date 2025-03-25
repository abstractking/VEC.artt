/**
 * Wallet Detection Utilities for VeChain
 * 
 * This module provides utilities for detecting and verifying various VeChain wallet providers
 * and provides user-friendly error messages.
 */

import { isBrowser } from './browser-info';

// Define these variables inline to avoid build problems with imports
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const isTestNet = typeof process !== 'undefined' && process.env.VITE_REACT_APP_VECHAIN_NETWORK === 'test';

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
 * with improved detection for different VeWorld versions and mobile environments
 */
export function isVeWorldWalletAvailable(): boolean {
  if (!isBrowser) return false;
  
  // First check for the standard vechain object
  const hasVeChain = typeof (window as any).vechain !== 'undefined';
  const hasConnex = typeof (window as any).connex !== 'undefined';
  
  // IMPROVED DETECTION: Try different checking methods
  let isVeWorldDetected = false;
  
  // Method 1: Check for vechain object with isVeWorld property
  if (hasVeChain) {
    const vechain = (window as any).vechain;
    if (vechain && vechain.isVeWorld === true) {
      isVeWorldDetected = true;
    }
  }
  
  // Method 2: Check for Vechain/VeWorld methods in the injected objects
  try {
    const vechain = (window as any).vechain;
    if (vechain && (
      typeof vechain.newConnex === 'function' ||
      typeof vechain.newConnexVendor === 'function' ||
      typeof vechain.getVendor === 'function' ||
      typeof vechain.request === 'function' // Added checking for request method
    )) {
      isVeWorldDetected = true;
    }
  } catch (e) {
    // Ignore errors in detection
  }
  
  // Method 3: For older VeWorld versions, check for specialized connex properties
  if (hasConnex) {
    const connex = (window as any).connex;
    if (connex && connex.thor && connex.vendor) {
      // This could be VeWorld or Sync2 - we'll still show it as an option
      // Further differentiation happens in the wallet connection code
      isVeWorldDetected = true;
    }
  }
  
  // Method 4: Check for mobile-specific pattern using navigator and user agent
  // Mobile detection is important for VeWorld which behaves differently on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  const isMobileApp = isMobile && (
    // Try to detect if we're inside a VeWorld mobile app webview
    navigator.userAgent.includes('VeWorld') || 
    // Some VeWorld mobile versions have a specific webview identifier
    navigator.userAgent.includes('Capacitor') ||
    // WKWebView is common on iOS applications
    navigator.userAgent.includes('WKWebView')
  );
  
  // Enhanced logging for easier debugging
  console.log("VeWorld wallet detection:", { 
    hasVeChain, 
    hasConnex, 
    isVeWorldDetected,
    isMobile,
    isMobileApp,
    vechainObject: hasVeChain ? Object.keys((window as any).vechain || {}) : null,
    connexObject: hasConnex ? Boolean((window as any).connex?.thor) : null,
    userAgent: navigator.userAgent
  });
  
  return isVeWorldDetected;
}

/**
 * Detects which wallets are available in the current browser environment
 * Returns an array of available wallet types
 */
export function detectAvailableWallets(): VeChainWalletType[] {
  const availableWallets: VeChainWalletType[] = [];
  
  // Check for browser extensions
  if (isThorWalletAvailable()) {
    availableWallets.push('thor');
  }
  
  if (isVeWorldWalletAvailable()) {
    availableWallets.push('veworld');
  }
  
  // Always include Sync options as they are desktop apps
  // that would open a separate window
  availableWallets.push('sync');
  availableWallets.push('sync2');
  
  // In development, also include environment key option
  if (!isNetlify) {
    availableWallets.push('environment');
  }
  
  return availableWallets;
}

/**
 * Attempts to detect the most appropriate wallet to use
 * based on available extensions or options
 */
export function detectBestWalletOption(): VeChainWalletType {
  const available = detectAvailableWallets();
  
  // Prioritize browser extensions over desktop options
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
  
  // Fallback to environment keys in development
  if (available.includes('environment')) {
    return 'environment';
  }
  
  // Default to thor as the original default
  return 'thor';
}

/**
 * Verifies if the specified wallet type is available
 * and returns detailed information
 */
export function verifyWalletAvailability(walletType: VeChainWalletType): WalletDetectionResult {
  switch (walletType) {
    case 'veworld':
      const veWorldAvailable = isVeWorldWalletAvailable();
      return {
        available: veWorldAvailable,
        installed: veWorldAvailable,
        walletType: 'veworld',
        message: veWorldAvailable 
          ? "VeWorld wallet detected"
          : "VeWorld wallet extension not detected. Please install the VeWorld extension for your browser, open it and select 'Test' network in the network dropdown, then try again."
      };
      
    case 'thor':
      const thorAvailable = isThorWalletAvailable();
      return {
        available: thorAvailable,
        installed: thorAvailable,
        walletType: 'thor',
        message: thorAvailable 
          ? "VeChainThor wallet detected"
          : "VeChainThor wallet extension not detected. Please install the VeChainThor wallet extension, configure it for TestNet, and try again."
      };
      
    case 'sync':
      // For desktop apps, we can't detect if they are installed
      return {
        available: true, // Always allow attempts to connect
        installed: false, // We don't know if it's installed
        walletType: 'sync',
        message: "Please ensure Sync desktop application is installed and running."
      };
      
    case 'sync2':
      // For desktop apps, we can't detect if they are installed
      return {
        available: true, // Always allow attempts to connect
        installed: false, // We don't know if it's installed
        walletType: 'sync2',
        message: "Please ensure Sync2 desktop application is installed, running, and configured for TestNet. When prompted, approve the connection request in the Sync2 application."
      };
      
    case 'environment':
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
      
    case 'walletconnect':
      // WalletConnect is not yet fully implemented
      return {
        available: false, // Set to false until fully implemented
        installed: false,
        walletType: 'walletconnect',
        message: "WalletConnect integration is coming soon."
      };
      
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