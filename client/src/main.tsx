import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import type { WalletConnectOptions } from '@vechain/dapp-kit';
import '@vechain/dapp-kit-ui';
import { DAppKitProvider } from '@vechain/dapp-kit-react';

const walletConnectOptions: WalletConnectOptions = {
    projectId: '5e81b15898eb5b868a361ed4f72f1293', // Using existing project ID
    metadata: {
        name: 'VeCollab',
        description: 'A decentralized collaboration platform on VeChain',
        url: window.location.origin,
        icons: [`${window.location.origin}/logo.png`],
    },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DAppKitProvider
            nodeUrl='https://testnet.vechain.org/'
            genesis='test'
            usePersistence
            walletConnectOptions={walletConnectOptions}
            logLevel='DEBUG'
            themeMode='LIGHT'
            allowedWallets={['veworld', 'sync2', 'wallet-connect']}
        >
            <App />
        </DAppKitProvider>
    </React.StrictMode>,
);