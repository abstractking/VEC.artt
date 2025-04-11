import * as React from 'react';

// Mock implementation for useVeChain hook without any actual blockchain interaction
export function useVeChain() {
  return {
    isConnected: false,
    account: null,
    error: null,
    isInitializing: false,
    connect: async () => {},
    disconnect: async () => {},
    submitTransaction: async () => '',
    waitForTransaction: async () => ({}),
  };
}

// Mock implementation for useWallet hook without any actual wallet interaction
export function useWallet() {
  return {
    walletAddress: null,
    isConnected: false,
    isConnecting: false,
    connectWallet: async () => {},
    disconnectWallet: async () => {},
    error: null,
  };
}