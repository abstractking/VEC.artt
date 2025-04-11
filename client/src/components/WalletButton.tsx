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
        // Check if we're in production and need to verify wallet availability
        const isDevEnv = window.location.hostname.includes('replit') || 
                      window.location.hostname === 'localhost' ||
                      import.meta.env.DEV;
                      
        if (!isDevEnv && !isVeWorldAvailable()) {
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