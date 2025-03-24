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
  
  // First check: vechain object with isVeWorld property exists
  const hasVeWorldObj = !!(window.vechain && window.vechain.isVeWorld);
  
  // Second check: user agent shows mobile and/or tablet device
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|iphone|ipad|ipod|mobile|tablet/.test(userAgent);
  
  // Third check: Check for capacitor/webview indicators (used by VeWorld mobile)
  const isCapacitorWebView = userAgent.includes('capacitor') || 
                             userAgent.includes('ionic') || 
                             (window as any).Capacitor || 
                             (window as any).Ionic;
  
  // Fourth check: Specific VeWorld app indicators
  const hasVeWorldIndicators = userAgent.includes('veworld') || 
                               userAgent.includes('vechaindapp') ||
                               (window as any)._veworld;
  
  // Log detection details for debugging
  console.log('VeWorld mobile detection:', {
    hasVeWorldObj,
    isMobileDevice,
    isCapacitorWebView,
    hasVeWorldIndicators,
    userAgent
  });
  
  // Consider running in VeWorld if the main identifier is present (vechain object)
  // plus at least one other indicator
  return hasVeWorldObj && (isMobileDevice || isCapacitorWebView || hasVeWorldIndicators);
}

/**
 * Determine if the device is specifically an iOS mobile device
 */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && 
         !window.MSStream; // Exclude Windows Phone
}

/**
 * Determine if the device is specifically an Android mobile device
 */
export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

/**
 * Get detailed information about the current VeWorld mobile environment
 * This can be useful for diagnostics and specific platform handling
 */
export function getVeWorldMobileInfo() {
  if (typeof window === 'undefined') return null;
  
  const userAgent = navigator.userAgent;
  const isVeWorld = !!(window.vechain && window.vechain.isVeWorld);
  const isIos = isIosDevice();
  const isAndroid = isAndroidDevice();
  
  // Try to determine VeWorld version from user agent or through API
  let version = 'unknown';
  try {
    if (window.vechain && (window.vechain as any).version) {
      version = (window.vechain as any).version;
    } else if ((window as any).veWorld && (window as any).veWorld.version) {
      version = (window as any).veWorld.version;
    }
    // Otherwise, try to extract from user agent
    else if (userAgent.includes('veworld/')) {
      const match = userAgent.match(/veworld\/(\d+(\.\d+)*)/i);
      if (match && match[1]) {
        version = match[1];
      }
    }
  } catch (e) {
    console.error('Error determining VeWorld version:', e);
  }
  
  // Get available methods to help with debugging
  const methods = window.vechain ? Object.keys(window.vechain) : [];
  
  return {
    isVeWorld,
    isVeWorldMobile: isVeWorldMobileApp(),
    platform: isIos ? 'iOS' : isAndroid ? 'Android' : 'unknown',
    userAgent,
    version,
    methods,
    supportsNewConnex: !!(window.vechain && typeof window.vechain.newConnex === 'function'),
    supportsVendor: !!(window.vechain && typeof window.vechain.newConnexVendor === 'function'),
    hasConnex: !!window.connex
  };
}

/**
 * Check if VeWorld wallet is available in any form (mobile or extension)
 */
export function isVeWorldAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  return !!(window.vechain && window.vechain.isVeWorld);
}