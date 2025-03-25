/**
 * VeWorld Mobile Detection
 * 
 * This module provides specialized detection logic for the VeWorld mobile application
 * environment, which has different characteristics than standard mobile browsers.
 */

/**
 * Check if running inside VeWorld mobile app's WebView
 * 
 * VeWorld mobile presents some specific characteristics:
 * 1. It has the `vechain` object with `isVeWorld` property
 * 2. It often has a specific user agent pattern
 * 3. It uses a capacitor/ionic webview
 */
export function isVeWorldMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for the vechain object with isVeWorld property
  const hasVeWorldObject = !!(window as any).vechain && (window as any).vechain.isVeWorld;
  
  // Check user agent for mobile app indicators
  const userAgent = navigator.userAgent.toLowerCase();
  const hasMobileAppIndicators = 
    userAgent.includes('veworld') || 
    userAgent.includes('wkwebview') || 
    userAgent.includes('capacitor') || 
    userAgent.includes('ionic');
  
  // Check for capacitor/ionic specific globals that might be present in the VeWorld mobile app
  const hasCapacitorGlobals = typeof (window as any).Capacitor !== 'undefined';
  
  return hasVeWorldObject && (hasMobileAppIndicators || hasCapacitorGlobals);
}

/**
 * Determine if the device is specifically an iOS mobile device
 */
export function isIosDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('iphone') || 
    userAgent.includes('ipad') || 
    userAgent.includes('ipod') ||
    // iOS 13+ on iPad shows as Macintosh in user agent
    (userAgent.includes('macintosh') && navigator.maxTouchPoints > 1)
  );
}

/**
 * Determine if the device is specifically an Android mobile device
 */
export function isAndroidDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('android');
}

/**
 * Get detailed information about the current VeWorld mobile environment
 * This can be useful for diagnostics and specific platform handling
 */
export function getVeWorldMobileInfo() {
  if (typeof window === 'undefined') {
    return {
      isVeWorldMobile: false,
      platform: 'unknown',
      userAgent: '',
      hasVeWorldObject: false,
      hasConnexObject: false
    };
  }
  
  const userAgent = navigator.userAgent;
  const hasVeWorldObject = !!(window as any).vechain && (window as any).vechain.isVeWorld;
  const hasConnexObject = !!(window as any).connex;
  
  let platform = 'unknown';
  if (isIosDevice()) {
    platform = 'ios';
  } else if (isAndroidDevice()) {
    platform = 'android';
  }
  
  return {
    isVeWorldMobile: isVeWorldMobileApp(),
    platform,
    userAgent,
    hasVeWorldObject,
    hasConnexObject
  };
}

/**
 * Check if VeWorld wallet is available in any form (mobile or extension)
 */
export function isVeWorldAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for the VeWorld browser extension or mobile app
  return !!(window as any).vechain && (window as any).vechain.isVeWorld;
}