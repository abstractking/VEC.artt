import * as React from 'react';
import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Network, NETWORKS } from '@/lib/Network';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { loadDAppKitUI, createDAppKitConfig, isBrowser, isMobileDevice } from '@/lib/dappkit-helpers';

// Define types for our context
type VeChainDAppKitContextType = {
  dappKit: any | null; // Use any to avoid TypeScript issues with DAppKitUI
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  network: Network;
  connect: (walletType?: VeChainWalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  submitTransaction: (clauses: any[], options?: any) => Promise<string>;
  waitForTransaction: (txId: string) => Promise<any>;
};

// Create context with default values
const VeChainDAppKitContext = createContext<VeChainDAppKitContextType>({
  dappKit: null,
  account: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  network: Network.TEST,
  connect: async () => {},
  disconnect: async () => {},
  submitTransaction: async () => '',
  waitForTransaction: async () => ({}),
});

// Custom hook to use the context
export const useVeChainDAppKit = () => useContext(VeChainDAppKitContext);

// Get network configuration based on environment
const getNetworkConfig = () => {
  // Use environment variables to determine network
  const isMainNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main';
  
  return {
    node: isMainNet 
      ? 'https://mainnet.veblocks.net'
      : 'https://testnet.veblocks.net',
    network: isMainNet ? 'main' : 'test',
    genesisId: isMainNet 
      ? NETWORKS[Network.MAIN].id
      : NETWORKS[Network.TEST].id
  };
};

// Map our wallet types to DAppKit wallet sources
const mapWalletType = (type?: VeChainWalletType): string | undefined => {
  if (!type) return undefined;
  
  switch (type) {
    case 'veworld':
      return 'veworld';
    case 'sync':
    case 'sync2':
    case 'thor':
      return 'sync2';
    case 'walletconnect':
    case 'wallet-connect':
      return 'wallet-connect';
    default:
      return undefined;
  }
};

// Provider component
interface VeChainDAppKitProviderProps {
  children: ReactNode;
}

export const VeChainDAppKitProvider: React.FC<VeChainDAppKitProviderProps> = ({ 
  children 
}) => {
  const [dappKit, setDappKit] = useState<any | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  // Get network configuration
  const config = getNetworkConfig();
  const networkType = config.network === 'main' ? Network.MAIN : Network.TEST;
  
  // Initialize DAppKit
  useEffect(() => {
    // Don't initialize if we're running server-side
    if (!isBrowser()) return;

    const initDAppKit = async () => {
      try {
        // Dynamically import DAppKit module
        const { DAppKitUI, error: importError } = await loadDAppKitUI();
        
        if (importError || !DAppKitUI) {
          console.error('[DAppKit] Failed to load DAppKit:', importError);
          setError(importError || new Error('Failed to load DAppKit module'));
          return;
        }
        
        // Get network type (main or test)
        const networkName = config.network === 'main' ? 'main' : 'test';
        
        // Create DAppKit configuration using helper
        const options = createDAppKitConfig(networkName as 'main' | 'test', config.node);
        
        console.log("[DAppKit] Configuration", JSON.stringify(options));
        console.log("[DAppKit] Environment:", import.meta.env.MODE);
        
        try {
          // Configure DAppKit with a timeout
          const veChainDAppKit = await Promise.race([
            Promise.resolve(DAppKitUI.configure(options)),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error('DAppKit initialization timed out')), 8000)
            )
          ]);
          
          console.log("[DAppKit] Initialized successfully");
          
          // Set DAppKit instance
          setDappKit(veChainDAppKit);
          
          // Check if we already have a connection from persistence
          if (veChainDAppKit?.wallet?.state?.account) {
            setAccount(veChainDAppKit.wallet.state.account);
            setIsConnected(true);
            console.log("[DAppKit] Restored previous connection to account:", veChainDAppKit.wallet.state.account);
          }
          
          // Register event listeners if wallet API is available
          if (veChainDAppKit?.wallet) {
            // Set up event listeners
            const onConnect = (account: string) => {
              console.log('[DAppKit] Connected to account:', account);
              setAccount(account);
              setIsConnected(true);
              setIsConnecting(false);
            };
            
            const onDisconnect = () => {
              console.log('[DAppKit] Disconnected');
              setAccount(null);
              setIsConnected(false);
            };
            
            const onError = (error: Error) => {
              console.error('[DAppKit] Error:', error);
              setError(error);
              setIsConnecting(false);
            };
            
            // Safely register event listeners
            if (typeof veChainDAppKit.wallet.on === 'function') {
              veChainDAppKit.wallet.on('connect', onConnect);
              veChainDAppKit.wallet.on('disconnect', onDisconnect);
              veChainDAppKit.wallet.on('error', onError);
              
              // Clean up event listeners
              return () => {
                if (veChainDAppKit && typeof veChainDAppKit.wallet.off === 'function') {
                  try {
                    veChainDAppKit.wallet.off('connect', onConnect);
                    veChainDAppKit.wallet.off('disconnect', onDisconnect);
                    veChainDAppKit.wallet.off('error', onError);
                  } catch (cleanupError) {
                    console.error('[DAppKit] Error during cleanup:', cleanupError);
                  }
                }
              };
            }
          }
        } catch (configError) {
          console.error('[DAppKit] Configuration error:', configError);
          setError(configError instanceof Error ? configError : new Error(String(configError)));
          
          // Show error notification in development mode
          if (import.meta.env.DEV) {
            toast({
              title: "DAppKit Configuration Error",
              description: configError instanceof Error ? configError.message : String(configError),
              variant: "destructive"
            });
          }
        }
      } catch (err) {
        console.error('[DAppKit] Initialization error:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };
    
    // Initialize DAppKit with a small delay to let React fully render
    // This helps with Netlify deployments and browser inconsistencies
    setTimeout(() => {
      initDAppKit();
    }, 500);
    
  }, [config.node, config.network, toast]);
  
  // Connect to wallet with specific wallet type
  const connect = useCallback(async (walletType?: VeChainWalletType) => {
    // If DAppKit is not initialized, attempt to show a better error message
    if (!dappKit) {
      console.error('[DAppKit] Connection attempt failed - DAppKit not initialized');
      
      // Check if we're on a mobile device without a proper wallet
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      if (isMobileDevice) {
        setError(new Error('Please install the VeWorld mobile app or use Sync2 mobile app to connect'));
        toast({
          title: "Mobile Wallet Required",
          description: "For mobile devices, please install the VeWorld or Sync2 mobile wallet app to connect",
          variant: "destructive"
        });
      } else {
        setError(new Error('DAppKit not initialized. Please ensure VeWorld or Sync2 extension is installed'));
        toast({
          title: "Wallet Connection Failed",
          description: "Please make sure you have the VeWorld or Sync2 extension installed and refresh the page",
          variant: "destructive"
        });
      }
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      console.log('[DAppKit] Connecting to wallet type:', walletType);
      
      // Map wallet type to DAppKit source
      const source = mapWalletType(walletType);
      
      if (source) {
        // Set specific source if provided
        console.log('[DAppKit] Setting wallet source:', source);
        try {
          await dappKit.wallet.setSource(source);
        } catch (sourceError) {
          console.error('[DAppKit] Failed to set wallet source:', sourceError);
          throw new Error(`Failed to set wallet source: ${sourceError.message || 'Unknown error'}`);
        }
      } else {
        console.log('[DAppKit] No source specified, using default source');
      }
      
      // Connect to wallet with a timeout to avoid hanging
      const response = await Promise.race([
        dappKit.wallet.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Wallet connection timed out after 15 seconds')), 15000)
        )
      ]);
      
      console.log('[DAppKit] Connection response:', response);
      
      // Update state with connected account
      if (response && response.address) {
        setAccount(response.address);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${response.address.substring(0, 6)}...${response.address.substring(response.address.length - 4)}`,
        });
        
        // Log additional connection information if available
        if (response.verified !== undefined) {
          console.log('[DAppKit] Connection verified:', response.verified);
        }
      } else {
        throw new Error('No address returned from wallet connection');
      }
    } catch (err) {
      console.error('[DAppKit] Wallet connection error:', err);
      
      // Provide a more specific error message based on the error
      let errorMessage = '';
      
      if (err.message?.includes('User rejected')) {
        errorMessage = 'Connection request was rejected by user';
      } else if (err.message?.includes('timed out')) {
        errorMessage = 'Connection timed out. Please check if your wallet is unlocked and try again';
      } else if (err.message?.includes('not installed') || err.message?.includes('not found')) {
        errorMessage = 'Wallet not detected. Please make sure you have the wallet installed';
      } else {
        errorMessage = err instanceof Error ? err.message : String(err);
      }
      
      setError(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  }, [dappKit, toast]);
  
  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    if (!dappKit) return;
    
    try {
      await dappKit.wallet.disconnect();
      setAccount(null);
      setIsConnected(false);
      
      toast({
        title: "Wallet Disconnected",
        description: "You've been disconnected from your wallet",
      });
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: "Disconnection Failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    }
  }, [dappKit, toast]);
  
  // Submit transaction
  const submitTransaction = useCallback(async (clauses: any[], options = {}) => {
    if (!dappKit || !dappKit.connex) {
      throw new Error('DAppKit not initialized or not connected');
    }
    
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    // Create transaction from clauses
    const signingService = dappKit.connex.vendor.sign('tx', clauses);
    
    // Set transaction options if provided
    if (options.comment) {
      signingService.comment(options.comment);
    }
    
    if (options.delegationHandler) {
      signingService.delegate(options.delegationHandler);
    }
    
    // Request signing
    const { txid } = await signingService.request();
    
    // Add transaction to toast notification
    toast({
      title: "Transaction Submitted",
      description: `Transaction ID: ${txid.substring(0, 8)}...${txid.substring(txid.length - 6)}`,
    });
    
    return txid;
  }, [dappKit, isConnected, toast]);
  
  // Wait for transaction to be confirmed
  const waitForTransaction = useCallback(async (txId: string) => {
    if (!dappKit || !dappKit.connex) {
      throw new Error('DAppKit not initialized');
    }
    
    const transaction = dappKit.connex.thor.transaction(txId);
    let receipt = await transaction.getReceipt();
    
    // Poll until receipt is available
    while (!receipt) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      receipt = await transaction.getReceipt();
    }
    
    return receipt;
  }, [dappKit]);
  
  // Context value
  const contextValue: VeChainDAppKitContextType = {
    dappKit,
    account,
    isConnected,
    isConnecting,
    error,
    network: networkType,
    connect,
    disconnect,
    submitTransaction,
    waitForTransaction,
  };
  
  return (
    <VeChainDAppKitContext.Provider value={contextValue}>
      {children}
    </VeChainDAppKitContext.Provider>
  );
};