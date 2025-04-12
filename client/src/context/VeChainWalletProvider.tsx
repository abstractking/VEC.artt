import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  connectWallet, 
  checkExistingConnection,
  saveWalletConnection,
  clearWalletConnection,
  WalletConnectionResult,
  ExtendedWalletType
} from '../lib/wallet-service';
import { isVeWorldWalletAvailable } from '../lib/wallet-detection';

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

  // Check if VeWorld wallet is available
  const isVeWorldAvailable = () => {
    // Use the wallet detection utility from our lib
    return isVeWorldWalletAvailable();
  };

  // Connect to wallet
  const connectToWallet = async () => {
    try {
      console.log("[VeChainWalletProvider] Connecting to wallet...");
      
      // Determine the most appropriate wallet type for the environment
      let walletType: ExtendedWalletType = 'auto'; // Use auto detection
      
      try {
        // Connect using the unified wallet service
        const result = await connectWallet(walletType);
        
        if (result.isConnected) {
          console.log(`[VeChainWalletProvider] Connected to wallet: ${result.name} with address: ${result.address}`);
          
          // Update wallet info in state
          setWalletInfo({
            name: result.name,
            address: result.address,
            isConnected: true
          });
          
          // Persist connection info using the wallet service
          if (result.address) {
            // If auto, use the wallet name to determine type, defaulting to veworld
            const actualWalletType = walletType === 'auto' 
              ? (result.name.toLowerCase().includes('thor') ? 'thor' : 
                 result.name.toLowerCase().includes('sync') ? 'sync' : 'veworld')
              : walletType;
              
            // Cast to valid VeChainWalletType (excluding 'auto' which isn't a valid VeChainWalletType)
            saveWalletConnection(result, actualWalletType as any);
          }
        } else {
          console.warn("[VeChainWalletProvider] Wallet connection failed:", result.error);
          throw new Error(result.error || "Failed to connect to wallet");
        }
      } catch (error) {
        console.error("[VeChainWalletProvider] Wallet connection error:", error);
        throw error;
      }
    } catch (error) {
      console.error("[VeChainWalletProvider] Error in connectToWallet:", error);
      throw error;
    }
  };

  // Disconnect from wallet
  const disconnectFromWallet = () => {
    console.log("[VeChainWalletProvider] Disconnecting wallet");
    
    setWalletInfo({
      name: 'Not Connected',
      address: null,
      isConnected: false
    });
    
    // Clear connection data using the wallet service
    clearWalletConnection();
  };

  // Check for existing connection on component mount
  useEffect(() => {
    const checkForExistingWallet = async () => {
      console.log("[VeChainWalletProvider] Checking for existing wallet connection");
      
      try {
        // Use the wallet service to check for existing connection
        const result = await checkExistingConnection();
        
        if (result && result.isConnected && result.address) {
          console.log(`[VeChainWalletProvider] Restored wallet connection: ${result.name}`);
          
          setWalletInfo({
            name: result.name,
            address: result.address,
            isConnected: true
          });
        }
      } catch (error) {
        console.error("[VeChainWalletProvider] Error checking existing connection:", error);
      }
    };

    checkForExistingWallet();
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