/**
 * Environment Service
 * 
 * This module centralizes all environment detection and configuration logic, 
 * ensuring consistent behavior across the application. It handles:
 * 
 * 1. Environment detection (development, production, Netlify, Replit, etc.)
 * 2. Environment variable access with validation and error handling
 * 3. Network configuration based on the environment
 */

// Environment types
export type EnvironmentType = 'development' | 'production' | 'test';
export type DeploymentType = 'local' | 'replit' | 'netlify' | 'vercel' | 'other';

// Network configuration type
export interface NetworkConfig {
  name: string;
  url: string;
  socketUrl?: string;
  chainId: string;
  genesisId: string;
}

// Centralized environment detection
export const environments = {
  // Is this a development environment? (including Replit)
  isDevelopment: typeof window !== 'undefined' && (
    window.location.hostname.includes('replit') || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    import.meta.env.DEV === true ||
    window.location.href.includes('localhost') ||
    window.location.href.includes('.app.github.dev') ||
    window.location.href.includes('127.0.0.1')
  ),

  // Is this a Netlify environment specifically?
  isNetlify: typeof window !== 'undefined' && 
    window.location.hostname.includes('netlify.app'),

  // Is this a Vercel environment?
  isVercel: typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('.now.sh')
  ),

  // Is this a Replit environment specifically?
  isReplit: typeof window !== 'undefined' && 
    window.location.hostname.includes('replit'),

  // Is this a local development server?
  isLocalhost: typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  ),

  // Is this a mobile device?
  isMobile: typeof window !== 'undefined' && (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth < 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0))
  )
};

// Get the current execution environment
export const getEnvironmentType = (): EnvironmentType => {
  if (import.meta.env.MODE === 'test' || import.meta.env.VITE_APP_ENV === 'test') {
    return 'test';
  }
  
  if (environments.isDevelopment) {
    return 'development';
  }
  
  return 'production';
};

// Get the current deployment platform
export const getDeploymentType = (): DeploymentType => {
  if (environments.isNetlify) return 'netlify';
  if (environments.isReplit) return 'replit';
  if (environments.isVercel) return 'vercel';
  if (environments.isLocalhost) return 'local';
  return 'other';
};

// Validate and get environment variables with proper error handling
export const getEnvVariable = (key: string, required = false): string | undefined => {
  const value = import.meta.env[key];
  
  if (required && (value === undefined || value === '')) {
    const errorMessage = `Required environment variable ${key} is missing`;
    console.error(errorMessage);
    
    // In development, provide more helpful guidance
    if (environments.isDevelopment) {
      console.info(`Hint: Add ${key} to your .env file or .env.local file`);
    }
    
    // Don't throw in production to avoid breaking the app, but return undefined
    if (getEnvironmentType() !== 'production') {
      throw new Error(errorMessage);
    }
  }
  
  return value;
};

// Get boolean environment variables (supporting 'true', '1', 'yes')
export const getBooleanEnvVariable = (key: string, defaultValue = false): boolean => {
  const value = getEnvVariable(key);
  if (value === undefined) return defaultValue;
  
  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

// Get network configuration based on environment
export const getNetworkConfig = (): NetworkConfig => {
  const selectedNetwork = getEnvVariable('VITE_REACT_APP_VECHAIN_NETWORK') || 'test';
  
  // Define networks with appropriate values
  const networks: Record<string, NetworkConfig> = {
    main: {
      name: 'MainNet',
      url: 'https://mainnet.veblocks.net',
      socketUrl: 'wss://mainnet.veblocks.net',
      chainId: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
      genesisId: '0x00000000851caf3cfdb44d49a556a3e1defc0ae1207be6ac36cc2d1b1c232409',
    },
    test: {
      name: 'TestNet',
      url: 'https://testnet.veblocks.net',
      socketUrl: 'wss://testnet.veblocks.net',
      chainId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
      genesisId: '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127',
    }
  };
  
  // Validate network selection
  if (!networks[selectedNetwork]) {
    console.warn(`Invalid network selection: ${selectedNetwork}, defaulting to TestNet`);
    return networks.test;
  }
  
  return networks[selectedNetwork];
};

// Check if private key is available for development environment
export const hasPrivateKey = (): boolean => {
  return !!getEnvVariable('VITE_VECHAIN_PRIVATE_KEY');
};

// Check if a feature is enabled via environment variable 
export const isFeatureEnabled = (featureName: string, defaultValue = false): boolean => {
  return getBooleanEnvVariable(`VITE_FEATURE_${featureName.toUpperCase()}`, defaultValue);
};

// Is this a demo mode environment? (for wallet connection testing)
export const isDemoModeEnabled = (): boolean => {
  return environments.isDevelopment || 
         environments.isNetlify || 
         getBooleanEnvVariable('VITE_FORCE_DEMO_MODE', false);
};

// Should we use demo wallet? (environment private key or dummy wallet)
export const shouldUseDemoWallet = (): boolean => {
  return isDemoModeEnabled() || 
         getBooleanEnvVariable('VITE_FORCE_DEV_WALLET', false);
};

// Get appropriate log level based on environment
export const getLogLevel = (): 'debug' | 'info' | 'warn' | 'error' => {
  const env = getEnvironmentType();
  const logLevel = getEnvVariable('VITE_LOG_LEVEL');
  
  if (logLevel) {
    switch (logLevel.toLowerCase()) {
      case 'debug': return 'debug';
      case 'info': return 'info';
      case 'warn': return 'warn';
      case 'error': return 'error';
    }
  }
  
  // Default log levels based on environment
  if (env === 'development') return 'debug';
  if (env === 'test') return 'info';
  return 'warn'; // Production default
};