import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { 
  DAppKitProvider as VeChainDAppKitProvider,
  DAppKitProviderOptions
} from '@vechain/dapp-kit-react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { WalletConnectOptions } from '@vechain/dapp-kit';

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
  
  // Create Web3Modal instance with minimal configuration
  // Using any type for configuration to bypass TypeScript errors
  // This is needed because the VeChain types don't perfectly match web3modal expectations
  const web3Modal = useMemo(() => {
    // Need to cast the config to any to avoid TypeScript errors with the web3modal API
    const modalConfig: any = {
      projectId: walletConnectOptions.projectId,
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#7c3aed',
        '--w3m-background-color': '#7c3aed',
      },
      // VeChain chain configuration
      defaultChain: {
        id: config.network === 'main' ? 74 : 39, // VeChain MainNet/TestNet chain IDs
        name: config.network === 'main' ? 'VeChain MainNet' : 'VeChain TestNet',
        nativeCurrency: {
          name: 'VET',
          symbol: 'VET',
          decimals: 18
        },
        rpcUrls: {
          default: { 
            http: [config.nodeUrl] 
          }
        }
      },
      metadata: {
        name: 'VeCollab',
        description: 'A decentralized collaboration platform built on VeChain',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`]
      }
    };
    
    return createWeb3Modal(modalConfig);
  }, [walletConnectOptions.projectId, config.network, config.nodeUrl]);
  
  // DAppKit provider options
  const dappKitOptions: DAppKitProviderOptions = {
    nodeUrl: config.nodeUrl,
    genesis: config.network, // 'main' or 'test'
    walletConnectOptions,
    usePersistence: true,
    logLevel: 'ERROR',
    // Make sure theme matches the application
    themeMode: 'LIGHT',
    // Allow all available wallets
    allowedWallets: ['wallet-connect', 'veworld', 'sync2', 'sync'],
    children: null // Will be set later
  };
  
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