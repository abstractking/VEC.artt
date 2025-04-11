import React from 'react';
import { useWallet } from '@vechain/dapp-kit-react';
import { Button } from '@/components/ui/button';

/**
 * Wallet connection button using VeChain DApp Kit
 */
export function WalletButton() {
  const { account, connect, disconnect } = useWallet();
  
  return (
    <Button
      onClick={() => (account ? disconnect() : connect())}
      variant="default"
      className="bg-primary hover:bg-primary-dark text-white"
    >
      {account
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : 'Connect Wallet'}
    </Button>
  );
}

export default WalletButton;