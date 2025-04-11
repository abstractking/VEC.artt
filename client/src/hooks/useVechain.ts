import { useState, useCallback } from 'react';
import { useVeChainWallet } from '../context/VeChainWalletProvider';

// Implementation for useVeChain hook using our VeChainWalletProvider
export function useVeChain() {
  const { walletInfo, connectWallet, disconnectWallet } = useVeChainWallet();
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

// Implementation for useWallet hook for compatibility with existing components
export function useWallet() {
  const { walletInfo, connectWallet, disconnectWallet, isVeWorldAvailable } = useVeChainWallet();
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