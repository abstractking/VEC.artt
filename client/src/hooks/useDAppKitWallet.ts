import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';

/**
 * Hook for interacting with VeChain wallet
 * 
 * This hook wraps our custom wallet context and provides a compatible
 * interface for existing components expecting the DAppKit interface.
 */
export function useDAppKitWallet() {
  const { 
    walletInfo,
    connectWallet,
    disconnectWallet,
    isVeWorldAvailable
  } = useWallet();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is connected
  const isConnected = walletInfo.isConnected;
  const account = walletInfo.address;

  // Clean up connection state when component unmounts
  useEffect(() => {
    return () => {
      setIsConnecting(false);
    };
  }, []);

  // Handle wallet connection
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Check if VeWorld wallet is available
      if (isVeWorldAvailable()) {
        await connectWallet();
      } else {
        setError('VeWorld wallet not installed. Please install it to connect.');
        // Open wallet provider website
        window.open('https://www.veworld.net/', '_blank');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [connectWallet, isVeWorldAvailable]);

  // Handle wallet disconnection
  const disconnect = useCallback(() => {
    try {
      disconnectWallet();
      setError(null);
    } catch (err) {
      console.error('Wallet disconnection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    }
  }, [disconnectWallet]);

  // Simulated modal open (we don't have a modal in our custom implementation)
  const openModal = useCallback(() => {
    // Instead of showing modal, just try connecting
    connect();
  }, [connect]);

  // Simulated available wallets list
  const availableWallets = ['veworld'];

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