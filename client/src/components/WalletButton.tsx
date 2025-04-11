import React from 'react';
import { Button } from '@/components/ui/button';
import { useVeChainWallet } from '../context/VeChainWalletProvider';

/**
 * VeChain wallet connection button using official VeChain tools
 */
export function WalletButton() {
  const { walletInfo, connectWallet, disconnectWallet, isVeWorldAvailable } = useVeChainWallet();

  const handleWalletAction = async () => {
    if (walletInfo.isConnected) {
      disconnectWallet();
    } else {
      try {
        if (!isVeWorldAvailable()) {
          alert('Please install VeWorld wallet extension to connect');
          window.open('https://www.veworld.net/');
          return;
        }
        await connectWallet();
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    }
  };

  return (
    <Button
      onClick={handleWalletAction}
      variant="default"
      className="bg-primary hover:bg-primary/90 text-white"
    >
      {walletInfo.isConnected && walletInfo.address
        ? `${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`
        : 'Connect Wallet'}
    </Button>
  );
}

export default WalletButton;