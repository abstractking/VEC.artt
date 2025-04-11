import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for VeChain wallets
interface WalletInfo {
  name: string;
  address: string | null;
  isConnected: boolean;
}

interface WalletContextType {
  walletInfo: WalletInfo;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isVeWorldAvailable: () => boolean;
}

// Create context with default values
const WalletContext = createContext<WalletContextType>({
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
export const useWallet = () => useContext(WalletContext);

// Context provider component
export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    name: 'Not Connected',
    address: null,
    isConnected: false
  });

  // Check if VeWorld wallet is available
  const isVeWorldAvailable = () => {
    return typeof window !== 'undefined' && window.vechain !== undefined;
  };

  // Connect to VeWorld wallet
  const connectWallet = async () => {
    if (isVeWorldAvailable()) {
      try {
        // Request account access
        const accounts = await window.vechain.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletInfo({
            name: 'VeWorld',
            address: accounts[0],
            isConnected: true
          });
          // Store connection in local storage
          localStorage.setItem('vechain_connected', 'true');
          localStorage.setItem('vechain_address', accounts[0]);
          return accounts[0];
        }
      } catch (error) {
        console.error('Error connecting to wallet:', error);
        throw error;
      }
    } else {
      // If VeWorld is not available, show message to install
      alert('Please install VeWorld wallet extension to connect');
      window.open('https://www.veworld.net/');
      throw new Error('VeWorld wallet not installed');
    }
  };

  // Disconnect from wallet
  const disconnectWallet = () => {
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
      
      if (isConnected && storedAddress && isVeWorldAvailable()) {
        // Verify connection is still valid
        try {
          const accounts = await window.vechain.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0 && accounts[0] === storedAddress) {
            setWalletInfo({
              name: 'VeWorld',
              address: accounts[0],
              isConnected: true
            });
            return;
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
      
      // If not found in local storage or validation failed, check if wallet is connected
      if (isVeWorldAvailable()) {
        try {
          const accounts = await window.vechain.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setWalletInfo({
              name: 'VeWorld',
              address: accounts[0],
              isConnected: true
            });
            // Update local storage
            localStorage.setItem('vechain_connected', 'true');
            localStorage.setItem('vechain_address', accounts[0]);
          }
        } catch (error) {
          console.error('Error checking wallet accounts:', error);
        }
      }
    };

    checkExistingConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (isVeWorldAvailable()) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else if (accounts[0] !== walletInfo.address) {
          // User switched accounts
          setWalletInfo({
            name: 'VeWorld',
            address: accounts[0],
            isConnected: true
          });
          localStorage.setItem('vechain_connected', 'true');
          localStorage.setItem('vechain_address', accounts[0]);
        }
      };

      // Attempt to add event listener
      const vechain = window.vechain;
      if (vechain && typeof vechain.on === 'function') {
        vechain.on('accountsChanged', handleAccountsChanged);
        
        // Clean up event listener
        return () => {
          if (vechain && typeof vechain.removeListener === 'function') {
            vechain.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      }
    }
  }, [walletInfo.address]);

  return (
    <WalletContext.Provider value={{ walletInfo, connectWallet, disconnectWallet, isVeWorldAvailable }}>
      {children}
    </WalletContext.Provider>
  );
};

// Add VeChain type definition
declare global {
  interface Window {
    vechain?: {
      request: (args: { method: string, params?: any[] }) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      removeListener?: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

export default WalletProvider;