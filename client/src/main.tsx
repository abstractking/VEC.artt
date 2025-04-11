import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createDAppKit, type WalletConnectOptions } from '@vechain/dapp-kit';
import '@vechain/dapp-kit-ui';
import { DAppKitProvider } from '@vechain/dapp-kit-react';

// Create WalletConnect options
const walletConnectOptions: WalletConnectOptions = {
    projectId: '5e81b15898eb5b868a361ed4f72f1293', // Use project ID from WalletConnect Cloud
    metadata: {
        name: 'VeCollab',
        description: 'A decentralized collaboration platform on VeChain',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
    },
};

// Create a DAppKit instance with custom http agent settings
const dAppKit = createDAppKit({
    nodeUrl: 'https://testnet.vechain.org/',
    genesis: 'test',
    usePersistence: true,
    walletConnectOptions,
    logLevel: 'DEBUG',
    themeMode: 'LIGHT',
    allowedWallets: ['veworld', 'sync2', 'wallet-connect'],
    disableDefaultFetchAgent: true, // Prevent HTTP Agent issues in browser
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DAppKitProvider value={dAppKit}>
            <App />
        </DAppKitProvider>
    </React.StrictMode>,
);