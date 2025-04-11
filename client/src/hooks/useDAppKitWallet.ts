import { useState, useCallback, useEffect } from 'react';
import { useWallet, useWalletModal } from '@vechain/dapp-kit-react';
import { VeChainWalletType } from '@/lib/wallet-detection';

/**
 * Hook for interacting with VeChain wallet through DAppKit
 * 
 * This hook wraps the functionality of the dapp-kit hooks and provides
 * a more convenient interface for wallet connection in our application.
 */
export function useDAppKitWallet() {
  const { 
    account, 
    connect: dappKitConnect, 
    disconnect: dappKitDisconnect,
    setSource,
    availableWallets
  } = useWallet();
  
  const { open: openWalletModal } = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is connected
  const isConnected = !!account;

  // Clean up connection state when component unmounts
  useEffect(() => {
    return () => {
      setIsConnecting(false);
    };
  }, []);

  // Handle wallet connection with specific wallet type
  const connect = useCallback(async (walletType?: VeChainWalletType) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // If wallet type is specified, try to connect directly
      if (walletType) {
        console.log(`Attempting to connect to wallet type: ${walletType}`);
        
        // Try to find a matching wallet source
        let matched = false;
        
        // Map legacy wallet types to DAppKit wallet sources
        if (walletType === 'veworld') {
          matched = true;
          try {
            // Just use the connect function - DAppKit will handle wallet selection
            await dappKitConnect();
          } catch (e) {
            console.error('Error connecting to VeWorld:', e);
            openWalletModal();
          }
        } 
        else if (walletType === 'sync' || walletType === 'sync2' || walletType === 'thor') {
          matched = true;
          try {
            // Just use the connect function - DAppKit will handle wallet selection
            await dappKitConnect();
          } catch (e) {
            console.error('Error connecting to Sync/Thor:', e);
            openWalletModal();
          }
        }
        else if (walletType === 'walletconnect' || walletType === 'wallet-connect') {
          matched = true;
          // Open modal for WalletConnect 
          openWalletModal();
        }
        
        // If we didn't find a match, open the modal
        if (!matched) {
          console.log('No direct match for wallet type, opening modal');
          openWalletModal();
        }
      } else {
        // If no wallet type is specified, open the modal
        openWalletModal();
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [dappKitConnect, openWalletModal]);

  // Handle wallet disconnection
  const disconnect = useCallback(() => {
    try {
      dappKitDisconnect();
      setError(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  }, [dappKitDisconnect]);

  // Open wallet selection modal
  const openModal = useCallback(() => {
    openWalletModal();
  }, [openWalletModal]);

  return {
    address: account,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    openModal,
    error,
    availableWallets
  };
}