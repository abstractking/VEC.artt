import React from 'react';
import { WalletButton as VeChainWalletButton } from '@vechain/dapp-kit-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Wallet connection button using VeChain DApp Kit
 */
export function WalletButton() {
  return (
    <VeChainWalletButton>
      {({ account, isConnecting, connect, disconnect }): ReactNode => (
        <Button
          onClick={() => (account ? disconnect() : connect())}
          variant="default"
          className="bg-primary hover:bg-primary-dark text-white"
          disabled={isConnecting}
        >
          {isConnecting
            ? 'Connecting...'
            : account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet'}
        </Button>
      )}
    </VeChainWalletButton>
  );
}

export default WalletButton;