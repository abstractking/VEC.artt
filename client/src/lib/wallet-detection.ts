/**
 * Wallet Detection Utilities for VeChain
 * 
 * This module provides utilities for detecting and verifying various VeChain wallet providers
 * and provides user-friendly error messages.
 */

import { isBrowser, isTestNet } from './browser-info';

// Define isNetlify here as it might not be exported from browser-info
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');

/**
 * Available VeChain wallet types
 */
export type VeChainWalletType = 'veworld' | 'thor' | 'sync' | 'sync2' | 'environment';

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
          : "VeWorld wallet extension not detected. Please install the VeWorld extension for your browser, configure it for TestNet, and try again."
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
        message: "Please ensure Sync2 desktop application is installed and running."
      };
      
    case 'environment':
      const envKeyAvailable = !isNetlify && process.env.VITE_VECHAIN_PRIVATE_KEY;
      return {
        available: envKeyAvailable,
        installed: envKeyAvailable,
        walletType: 'environment',
        message: envKeyAvailable 
          ? "Environment key available for development use"
          : "No environment key available. This option is only available in development mode."
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
    default: return 'Unknown Wallet';
  }
}