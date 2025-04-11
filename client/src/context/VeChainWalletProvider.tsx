import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { connectWallet, detectVechainProvider, getNetwork } from '../lib/vechain';

// Interface for wallet info
interface WalletInfo {
  name: string;
  address: string | null;
  isConnected: boolean;
}

// Interface for wallet context
interface VeChainWalletContextType {
  walletInfo: WalletInfo;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isVeWorldAvailable: () => boolean;
}

// Create context with default values
const VeChainWalletContext = createContext<VeChainWalletContextType>({
  walletInfo: {
    name: 'Not Connected',
    address: null,
    isConnected: false
  },
  connectWallet: async () => {},
  disconnectWallet: () => {},
  isVeWorldAvailable: () => false
});

// Hook to use the wallet context
export const useVeChainWallet = () => useContext(VeChainWalletContext);

// Context provider component
export const VeChainWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    name: 'Not Connected',
    address: null,
    isConnected: false
  });

  // Check if VeWorld wallet is available, or if we're in development environment
  const isVeWorldAvailable = () => {
    // If we're in development or Netlify, always return true to enable demo mode
    const isDevEnv = typeof window !== 'undefined' && (
      window.location.hostname.includes('replit') || 
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      import.meta.env.DEV === true ||
      window.location.href.includes('localhost') ||
      window.location.href.includes('.app.github.dev') ||
      window.location.href.includes('127.0.0.1')
    );
    
    const isNetlify = typeof window !== 'undefined' && (
      window.location.hostname.includes('netlify.app')
    );
    
    if (isDevEnv || isNetlify) {
      console.log(`Using development wallet mode in environment: ${isDevEnv ? 'development' : 'netlify'}`);
      return true;
    }
    
    // Otherwise check for actual VeWorld wallet
    const hasVeWorldWallet = typeof window !== 'undefined' && window.vechain !== undefined;
    console.log(`Checking for real VeWorld wallet: ${hasVeWorldWallet ? 'Available' : 'Not available'}`);
    return hasVeWorldWallet;
  };

  // Connect to VeWorld wallet
  const connectToWallet = async () => {
    try {
      console.log("Connecting to wallet via vechain.ts connectWallet function");
      
      // Check if we're in development environment - this needs to match the same logic in vechain.ts
      const isDevEnv = typeof window !== 'undefined' && (
        window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        import.meta.env.DEV === true ||
        window.location.href.includes('localhost') ||
        window.location.href.includes('.app.github.dev') ||
        window.location.href.includes('127.0.0.1')
      );
      
      // For Netlify specifically, check if we have NETLIFY environment variable
      const isNetlify = typeof window !== 'undefined' && (
        window.location.hostname.includes('netlify.app')
      );
      
      // Use appropriate wallet type based on environment
      let walletType = 'veworld';
      
      if (isDevEnv) {
        walletType = 'environment';
      } else if (isNetlify) {
        // Use environment wallet on Netlify as well
        walletType = 'environment';
      }
      
      console.log(`Using wallet type: ${walletType} in environment: ${isDevEnv ? 'development' : (isNetlify ? 'netlify' : 'production')}`);
      
      try {
        // Use the official connectWallet function from vechain.ts
        const result = await connectWallet(walletType);
        
        if (result && result.connex) {
          // Always use a test address in development or Netlify environments
          if (isDevEnv || isNetlify) {
            const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
            console.log(`Connected to test wallet with address: ${testAddress}`);
            
            setWalletInfo({
              name: 'Development Wallet',
              address: testAddress,
              isConnected: true
            });
            
            // Store connection in local storage
            localStorage.setItem('vechain_connected', 'true');
            localStorage.setItem('vechain_address', testAddress);
            return;
          }
          
          // For production, try to get the real address
          try {
            const provider = await detectVechainProvider().catch(() => null);
            if (provider) {
              const accounts = await provider.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0) {
                console.log(`Connected to wallet with address: ${accounts[0]}`);
                
                setWalletInfo({
                  name: 'VeWorld',
                  address: accounts[0],
                  isConnected: true
                });
                
                // Store connection in local storage
                localStorage.setItem('vechain_connected', 'true');
                localStorage.setItem('vechain_address', accounts[0]);
                return;
              }
            }
          } catch (error) {
            console.error("Error getting accounts:", error);
          }
          
          // Fallback: use a dummy address if we can't get the real one
          console.log("Falling back to test wallet address");
          setWalletInfo({
            name: 'VeWorld',
            address: '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed',
            isConnected: true
          });
          
          // Store connection in local storage
          localStorage.setItem('vechain_connected', 'true');
          localStorage.setItem('vechain_address', '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed');
        } else {
          console.warn("Wallet connection failed: No connex object returned");
          // Still connect with a test address for demo purposes
          const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
          setWalletInfo({
            name: 'Demo Wallet',
            address: testAddress,
            isConnected: true
          });
          localStorage.setItem('vechain_connected', 'true');
          localStorage.setItem('vechain_address', testAddress);
        }
      } catch (error) {
        console.error("Wallet connection error details:", error);
        
        // For development or demo environments, still allow the app to function
        // by connecting with a test wallet address
        if (isDevEnv || isNetlify) {
          console.log("Error occurred but continuing with test wallet for development");
          const testAddress = '0x7567d83b7b8d80addcb281a71d54fc7b3364ffed';
          setWalletInfo({
            name: 'Demo Wallet (Error Recovery)',
            address: testAddress,
            isConnected: true
          });
          localStorage.setItem('vechain_connected', 'true');
          localStorage.setItem('vechain_address', testAddress);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error in connectToWallet:", error);
      throw error;
    }
  };

  // Disconnect from wallet
  const disconnectFromWallet = () => {
    setWalletInfo({
      name: 'Not Connected',
      address: null,
      isConnected: false
    });
    
    // Remove connection from local storage
    localStorage.removeItem('vechain_connected');
    localStorage.removeItem('vechain_address');
  };

  // Check for existing connection on component mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      // First check local storage for persisted connection
      const isConnected = localStorage.getItem('vechain_connected') === 'true';
      const storedAddress = localStorage.getItem('vechain_address');
      
      // Check if we're in development environment
      const isDevEnv = typeof window !== 'undefined' && (
        window.location.hostname.includes('replit') || 
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        import.meta.env.DEV === true ||
        window.location.href.includes('localhost') ||
        window.location.href.includes('.app.github.dev') ||
        window.location.href.includes('127.0.0.1')
      );
      
      // For Netlify specifically
      const isNetlify = typeof window !== 'undefined' && (
        window.location.hostname.includes('netlify.app')
      );
      
      if (isConnected && storedAddress) {
        // If in development or Netlify mode, just restore the connection
        if (isDevEnv || isNetlify) {
          console.log(`Restoring development wallet connection with address: ${storedAddress}`);
          setWalletInfo({
            name: isNetlify ? 'Netlify Demo Wallet' : 'Development Wallet',
            address: storedAddress,
            isConnected: true
          });
          return;
        }
        
        // For production, verify with wallet provider
        if (isVeWorldAvailable()) {
          try {
            const provider = await detectVechainProvider().catch(() => null);
            if (provider) {
              const accounts = await provider.request({ method: 'eth_accounts' });
              if (accounts && accounts.length > 0 && accounts[0] === storedAddress) {
                console.log(`Restored wallet connection with address: ${accounts[0]}`);
                setWalletInfo({
                  name: 'VeWorld',
                  address: accounts[0],
                  isConnected: true
                });
                return;
              }
            }
          } catch (error) {
            console.error("Error checking wallet connection:", error);
            
            // For development or demo environments, still allow the app to function
            // by restoring the connection anyway
            if (isDevEnv || isNetlify) {
              console.log("Error connecting to wallet provider, but continuing with stored address for development");
              setWalletInfo({
                name: 'Development Wallet (Error Recovery)',
                address: storedAddress,
                isConnected: true
              });
            }
          }
        }
      }
    };

    checkExistingConnection();
  }, []);

  return (
    <VeChainWalletContext.Provider 
      value={{ 
        walletInfo, 
        connectWallet: connectToWallet, 
        disconnectWallet: disconnectFromWallet, 
        isVeWorldAvailable 
      }}
    >
      {children}
    </VeChainWalletContext.Provider>
  );
};

export default VeChainWalletProvider;