import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { DAppKitUI } from '@vechain/dapp-kit-ui';
import { useToast } from '@/hooks/use-toast';
import { Network, NETWORKS } from '@/lib/Network';
import { VeChainWalletType } from '@/lib/wallet-detection';

// Define types for our context
type VeChainDAppKitContextType = {
  dappKit: DAppKitUI | null;
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
  const [dappKit, setDappKit] = useState<DAppKitUI | null>(null);
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
    try {
      // Set up WalletConnect options
      const walletConnectOptions = {
        projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5e81b15898eb5b868a361ed4f72f1293',
        metadata: {
          name: 'VeCollab',
          description: 'A decentralized collaboration platform on VeChain',
          url: window.location.origin,
          icons: [`${window.location.origin}/logo.png`],
        },
      };
      
      // Create DAppKit with options
      const veChainDAppKit = new DAppKitUI({
        node: config.node,
        network: config.network,
        usePersistence: true,
        walletConnectOptions,
        logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'ERROR',
        themeMode: 'LIGHT',
        allowedWallets: ['veworld', 'sync2', 'wallet-connect']
      });
      
      // Set DAppKit instance
      setDappKit(veChainDAppKit);
      
      // Check if we already have a connection from persistence
      if (veChainDAppKit.wallet.state.account) {
        setAccount(veChainDAppKit.wallet.state.account);
        setIsConnected(true);
      }
      
      // Set up event listeners
      const onConnect = (account: string) => {
        console.log('DAppKit connected to account:', account);
        setAccount(account);
        setIsConnected(true);
        setIsConnecting(false);
      };
      
      const onDisconnect = () => {
        console.log('DAppKit disconnected');
        setAccount(null);
        setIsConnected(false);
      };
      
      const onError = (error: Error) => {
        console.error('DAppKit error:', error);
        setError(error);
        setIsConnecting(false);
      };
      
      // Register events
      veChainDAppKit.wallet.on('connect', onConnect);
      veChainDAppKit.wallet.on('disconnect', onDisconnect);
      veChainDAppKit.wallet.on('error', onError);
      
      // Clean up event listeners
      return () => {
        veChainDAppKit.wallet.off('connect', onConnect);
        veChainDAppKit.wallet.off('disconnect', onDisconnect);
        veChainDAppKit.wallet.off('error', onError);
      };
    } catch (err) {
      console.error('Error initializing DAppKit:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [config.node, config.network]);
  
  // Connect to wallet with specific wallet type
  const connect = useCallback(async (walletType?: VeChainWalletType) => {
    if (!dappKit) {
      setError(new Error('DAppKit not initialized'));
      return;
    }
    
    try {
      setIsConnecting(true);
      setError(null);
      
      // Map wallet type to DAppKit source
      const source = mapWalletType(walletType);
      
      if (source) {
        // Set specific source if provided
        await dappKit.wallet.setSource(source);
      }
      
      // Connect to wallet
      const response = await dappKit.wallet.connect();
      
      // Update state with connected account
      if (response && response.address) {
        setAccount(response.address);
        setIsConnected(true);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${response.address.substring(0, 6)}...${response.address.substring(response.address.length - 4)}`,
        });
      } else {
        throw new Error('No address returned from wallet connection');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : String(err),
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