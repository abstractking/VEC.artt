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
    window.location.hostname.includes('.now.sh') ||
    window.location.port === '3000' || // Vercel dev uses port 3000 by default
    import.meta.env.VITE_DEPLOYMENT_ENV === 'vercel' ||
    (typeof process !== 'undefined' && process.env && process.env.VERCEL === '1')
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
  // Check both possible environment variable names (VITE_VECHAIN_NETWORK or VITE_REACT_APP_VECHAIN_NETWORK)
  const selectedNetwork = getEnvVariable('VITE_VECHAIN_NETWORK') || 
                          getEnvVariable('VITE_REACT_APP_VECHAIN_NETWORK') || 
                          'test';
  
  // Allow overriding of specific network parameters using environment variables
  const mainnetUrl = getEnvVariable('VITE_VECHAIN_NODE_URL_MAINNET') || 'https://mainnet.veblocks.net';
  const testnetUrl = getEnvVariable('VITE_VECHAIN_NODE_URL_TESTNET') || 'https://testnet.veblocks.net';
  
  // Get genesis IDs from environment variables if available
  const mainnetGenesisId = getEnvVariable('VITE_VECHAIN_MAINNET_GENESIS_ID') || 
                           '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a';
  const testnetGenesisId = getEnvVariable('VITE_VECHAIN_TESTNET_GENESIS_ID') || 
                           '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
  
  // Define networks with appropriate values
  const networks: Record<string, NetworkConfig> = {
    main: {
      name: 'MainNet',
      url: mainnetUrl,
      socketUrl: mainnetUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
      chainId: mainnetGenesisId,
      genesisId: mainnetGenesisId,
    },
    test: {
      name: 'TestNet',
      url: testnetUrl,
      socketUrl: testnetUrl.replace('https://', 'wss://').replace('http://', 'ws://'),
      chainId: testnetGenesisId,
      genesisId: testnetGenesisId,
    }
  };
  
  // Log configuration for debugging in non-production environments
  if (getEnvironmentType() !== 'production') {
    console.info('[Network Config]', {
      selectedNetwork,
      mainnetUrl,
      testnetUrl,
      mainnetGenesisId,
      testnetGenesisId,
      environment: getDeploymentType()
    });
  }
  
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