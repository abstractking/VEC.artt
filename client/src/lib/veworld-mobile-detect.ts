/**
 * VeWorld Mobile Detection
 * Enhanced implementation with better error handling and debugging
 */

const MOBILE_USER_AGENT_PATTERN = /android|iphone|ipad|ipod|mobile|tablet/i;
const VEWORLD_USER_AGENT_KEYWORDS = ['veworld', 'vechaindapp'];
const WEBVIEW_INDICATORS = ['wv', 'webview', 'capacitor', 'ionic'];

const isDebugMode = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (isDebugMode) {
    console.log(`[VeWorld Mobile] ${message}`, data || '');
  }
}

interface VeWorldMobileInfo {
  isVeWorld: boolean;
  isVeWorldMobile: boolean;
  platform: 'iOS' | 'Android' | 'unknown';
  userAgent: string;
  version: string;
  methods: string[];
  supportsNewConnex: boolean;
  supportsVendor: boolean;
  hasConnex: boolean;
}

export function isVeWorldMobileApp(): boolean {
  if (typeof window === 'undefined') return false;

  const vechain = window.vechain || {};
  const userAgent = navigator.userAgent.toLowerCase();

  const hasVeWorldObj = !!vechain.isVeWorld;
  const isMobileDevice = MOBILE_USER_AGENT_PATTERN.test(userAgent);
  const isWebView = WEBVIEW_INDICATORS.some(indicator => userAgent.includes(indicator)) ||
                   userAgent.includes('mobile') ||
                   'standalone' in navigator ||
                   (window as any).webkit?.messageHandlers;

  const hasVeWorldIndicators = VEWORLD_USER_AGENT_KEYWORDS.some(keyword => userAgent.includes(keyword)) || 
                              (window as any)._veworld ||
                              document.documentElement.classList.contains('veworld-app');

  debugLog('Detection details:', {
    hasVeWorldObj,
    isMobileDevice,
    isWebView,
    hasVeWorldIndicators,
    userAgent
  });

  return (hasVeWorldObj || (isMobileDevice && (isWebView))) && hasVeWorldIndicators;
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent) && !userAgent.includes('windows phone');
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

export function getVeWorldMobileInfo(): VeWorldMobileInfo | null {
  if (typeof window === 'undefined') return null;

  const userAgent = navigator.userAgent;
  const vechain = window.vechain || {};
  const isVeWorld = !!vechain.isVeWorld;
  const isIos = isIosDevice();
  const isAndroid = isAndroidDevice();

  let version = 'unknown';
  try {
    const versionMatch = userAgent.match(/veworld\/(\d+(\.\d+)*)/i);
    version = vechain.version || 
              (window as any).veWorld?.version ||
              (versionMatch && versionMatch[1]) || 
              'unknown';
  } catch (e) {
    debugLog('Error determining version:', e);
  }

  const methods = vechain ? Object.keys(vechain) : [];

  return {
    isVeWorld,
    isVeWorldMobile: isVeWorldMobileApp(),
    platform: isIos ? 'iOS' : isAndroid ? 'Android' : 'unknown',
    userAgent,
    version,
    methods,
    supportsNewConnex: typeof vechain.newConnex === 'function',
    supportsVendor: typeof vechain.newConnexVendor === 'function',
    hasConnex: !!window.connex
  };
}

export function isVeWorldAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window.vechain && window.vechain.isVeWorld);
}