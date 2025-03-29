import React, { createContext, useContext, ReactNode } from 'react';
import { 
  createConfig,
  http,
  Config
} from '@vechain/dapp-kit';
import { DAppKitProvider as VeChainDAppKitProvider } from '@vechain/dapp-kit-react';
import { 
  createWeb3Modal, 
  defaultConfig, 
  Web3Modal 
} from '@web3modal/wagmi';

// Network constants for VeChain
const VECHAIN_TESTNET_NODE_URL = import.meta.env.VITE_VECHAIN_NODE_URL_TESTNET || 'https://testnet.veblocks.net';
const VECHAIN_MAINNET_NODE_URL = import.meta.env.VITE_VECHAIN_NODE_URL_MAINNET || 'https://mainnet.veblocks.net';
const VECHAIN_TESTNET_GENESIS_ID = import.meta.env.VITE_VECHAIN_TESTNET_GENESIS_ID || '0x000000000b2bce3c70bc649a02749e8687721b09ed2e15997f466536b20bb127';
const VECHAIN_MAINNET_GENESIS_ID = import.meta.env.VITE_VECHAIN_MAINNET_GENESIS_ID || '0x00000000851caf3cfdb6e899cf5958bfb1ac3413d346d43539627e6be7ec1b4a';

// Network selection based on environment
const isMainNet = import.meta.env.VITE_REACT_APP_VECHAIN_NETWORK === 'main';
const NODE_URL = isMainNet ? VECHAIN_MAINNET_NODE_URL : VECHAIN_TESTNET_NODE_URL;
const GENESIS_ID = isMainNet ? VECHAIN_MAINNET_GENESIS_ID : VECHAIN_TESTNET_GENESIS_ID;
const NETWORK_NAME = isMainNet ? 'main' : 'test';

// WalletConnect Project ID
const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Create a context for our DApp Kit configuration
type DAppKitContextType = {
  config: Config;
  web3Modal: Web3Modal;
};

const DAppKitContext = createContext<DAppKitContextType | null>(null);

export const useDAppKit = () => {
  const context = useContext(DAppKitContext);
  if (!context) {
    throw new Error('useDAppKit must be used within a DAppKitProvider');
  }
  return context;
};

interface DAppKitProviderProps {
  children: ReactNode;
}

export function DAppKitProvider({ children }: DAppKitProviderProps) {
  // Create the config object
  const config = createConfig({
    transports: {
      [NETWORK_NAME]: http(NODE_URL, {
        genesisId: GENESIS_ID,
      }),
    },
  });

  // Setup Web3Modal (used by DApp Kit for WalletConnect)
  const web3Modal = createWeb3Modal({
    ...defaultConfig({
      metadata: {
        name: 'VeCollab Marketplace',
        description: 'A marketplace for digital creators on VeChain',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
        url: window.location.origin,
      },
    }),
    projectId: WALLETCONNECT_PROJECT_ID,
    enableAnalytics: false, // Optional and can be disabled
    themeMode: 'light', // or 'dark' or 'system'
    enableOnramp: false,
  });

  const contextValue = {
    config,
    web3Modal,
  };

  return (
    <DAppKitContext.Provider value={contextValue}>
      <VeChainDAppKitProvider config={config}>
        {children}
      </VeChainDAppKitProvider>
    </DAppKitContext.Provider>
  );
}