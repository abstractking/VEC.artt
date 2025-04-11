import { useState, useCallback } from 'react';
import * as WalletContextModule from '../context/WalletContext';

// Use a different name to avoid name conflicts
const useWalletFromContext = WalletContextModule.useWallet;

// Implementation for useVeChain hook using our custom wallet context
export function useVeChain() {
  const { walletInfo, connectWallet, disconnectWallet } = useWalletFromContext();
  const [error, setError] = useState<string | null>(null);

  const submitTransaction = useCallback(async () => {
    setError('Transactions not implemented in this version');
    return '';
  }, []);

  const waitForTransaction = useCallback(async () => {
    return {};
  }, []);

  return {
    isConnected: walletInfo.isConnected,
    account: walletInfo.address,
    error,
    isInitializing: false,
    connect: connectWallet,
    disconnect: disconnectWallet,
    submitTransaction,
    waitForTransaction,
  };
}

// Implementation for useWallet hook using our custom wallet context
export function useWallet() {
  // Use our renamed import to avoid recursion
  const { walletInfo, connectWallet, disconnectWallet, isVeWorldAvailable } = useWalletFromContext();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRealWallet, setUseRealWallet] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  const connectWalletWrapper = async () => {
    try {
      setIsConnecting(true);
      await connectWallet();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleRealWallet = () => {
    setUseRealWallet(!useRealWallet);
  };

  return {
    walletAddress: walletInfo.address,
    isConnected: walletInfo.isConnected,
    isConnecting,
    connectWallet: connectWalletWrapper,
    disconnectWallet,
    error,
    useRealWallet,
    toggleRealWallet,
    isModalOpen,
    setModalOpen
  };
}