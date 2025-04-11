import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  DAppKitProvider as VeChainDAppKitProvider,
  DAppKitProviderOptions
} from '@vechain/dapp-kit-react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WalletConnectOptions } from '@vechain/dapp-kit';
import { createConfig, http } from 'wagmi';
import { mainnet } from 'wagmi/chains';

// Configuration type for our DAppKit context
type Config = {
  nodeUrl: string;
  network: 'main' | 'test';
  genesisId: string;
};

// Define context type
type DAppKitContextType = {
  config: Config;
  web3Modal: ReturnType<typeof createWeb3Modal>;
};

// Create context
const DAppKitContext = createContext<DAppKitContextType | null>(null);

// Hook to use DAppKit context
export const useDAppKit = () => {
  const context = useContext(DAppKitContext);
  if (!context) {
    throw new Error('useDAppKit must be used within a DAppKitProvider');
  }
  return context;
};

// Get network configuration from environment
const getNetworkConfig = (): Config => {
  const isMainNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main';
  
  // Genesis IDs
  const genesisIdMainnet = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || 
    '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a';
  const genesisIdTestnet = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || 
    '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
  
  return {
    nodeUrl: isMainNet 
      ? (import.meta.env.VITE_VECHAIN_NODE_URL_MAINNET || 'https://mainnet.veblocks.net')
      : (import.meta.env.VITE_VECHAIN_NODE_URL_TESTNET || 'https://testnet.veblocks.net'),
    network: isMainNet ? 'main' : 'test',
    genesisId: isMainNet ? genesisIdMainnet : genesisIdTestnet
  };
};

// Props interface
interface DAppKitProviderProps {
  children: ReactNode;
}

// Our DAppKit Provider
export function DAppKitProvider({ children }: DAppKitProviderProps) {
  // Get config based on environment
  const config = useMemo(() => getNetworkConfig(), []);
  
  // Set up WalletConnect options
  const walletConnectOptions: WalletConnectOptions = useMemo(() => ({
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '5e81b15898eb5b868a361ed4f72f1293',
    metadata: {
      name: 'VeCollab',
      description: 'A decentralized collaboration platform built on VeChain',
      url: window.location.origin,
      icons: [`${window.location.origin}/logo.png`]
    }
  }), []);
  
  // Create wagmi config (required by web3modal)
  const wagmiConfig = useMemo(() => {
    return createConfig({
      // Use a placeholder chain as the real VeChain chain will be defined in DAppKit
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    });
  }, []);
  
  // Create Web3Modal instance with minimal configuration
  const web3Modal = useMemo(() => {
    return createWeb3Modal({
      wagmiConfig,
      projectId: walletConnectOptions.projectId,
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#7c3aed'
      },
      // Basic metadata for the web3modal
      metadata: {
        name: 'VeCollab',
        description: 'A decentralized collaboration platform built on VeChain',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`]
      }
    });
  }, [wagmiConfig, walletConnectOptions.projectId]);
  
  // DAppKit provider options - following VeChain documentation recommendations
  // Apply TypeScript type casting to handle property discrepancies
  const dappKitOptions = {
    // Required - The URL of the node to connect to
    nodeUrl: config.nodeUrl,
    
    // Genesis configuration
    genesis: config.network,
    
    // WalletConnect options
    walletConnectOptions,
    
    // Enable persistence to remember the user's wallet choice
    usePersistence: true,
    
    // Let the user choose their wallet instead of auto-selecting
    useFirstDetectedSource: false,
    
    // Enable debug logging in development
    logLevel: process.env.NODE_ENV === 'development' ? 'DEBUG' : 'ERROR', 
    
    // Make sure theme matches the application
    themeMode: 'LIGHT',
    
    // Allow all wallet types
    allowedWallets: ['wallet-connect', 'veworld', 'sync2', 'sync'],
  } as DAppKitProviderOptions;
  
  // Context value
  const contextValue = {
    config,
    web3Modal
  };
  
  return (
    <DAppKitContext.Provider value={contextValue}>
      <VeChainDAppKitProvider {...dappKitOptions}>
        {children}
      </VeChainDAppKitProvider>
    </DAppKitContext.Provider>
  );
}