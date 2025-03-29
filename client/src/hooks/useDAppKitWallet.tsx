import { useState, useEffect, useCallback } from 'react';
import { useWallet, useWalletModal } from '@vechain/dapp-kit-react';
import { useDAppKit } from '@/contexts/DAppKitProvider';
import { VeChainWalletType } from '@/lib/wallet-detection';
import { useToast } from '@/hooks/use-toast';

export interface UseDAppKitWalletReturn {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: (walletType?: VeChainWalletType) => Promise<void>;
  disconnect: () => void;
}

export function useDAppKitWallet(): UseDAppKitWalletReturn {
  const { web3Modal } = useDAppKit();
  const walletContext = useWallet();
  const walletModal = useWalletModal();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Check if connected
  const isConnected = !!walletContext.account;
  const address = walletContext.account;

  // Connect to wallet based on type
  const connect = useCallback(async (walletType?: VeChainWalletType) => {
    try {
      setIsConnecting(true);
      setError(null);

      console.log(`Attempting to connect to wallet type: ${walletType}`);

      // Different connection strategies based on wallet type
      if (walletType === 'walletconnect' || walletType === 'wallet-connect') {
        // Open WalletConnect modal
        web3Modal.open();
      } else if (walletType === 'veworld') {
        console.log('Connecting to VeWorld wallet...');
        
        // VeWorld needs special handling to ensure it opens the wallet application
        // Import the vechain.ts module dynamically to avoid circular dependencies
        try {
          const vechainModule = await import('@/lib/vechain');
          await vechainModule.connectWallet('veworld');
          
          // After successful connection with the native module,
          // also update the DAppKit state for consistency
          walletContext.setSource(walletType);
          await walletContext.connect();
        } catch (error) {
          console.error('Error connecting to VeWorld:', error);
          throw error;
        }
      } else if (walletType === 'sync' || walletType === 'sync2') {
        console.log(`Connecting to ${walletType} wallet...`);
        
        // Sync wallets need special handling too
        try {
          const vechainModule = await import('@/lib/vechain');
          await vechainModule.connectWallet(walletType);
          
          // After successful connection with the native module,
          // also update the DAppKit state for consistency
          walletContext.setSource(walletType);
          await walletContext.connect();
        } catch (error) {
          console.error(`Error connecting to ${walletType}:`, error);
          throw error;
        }
      } else {
        // If no wallet type specified, open the wallet selection modal
        walletModal.open();
      }

      // Save wallet info to local storage
      if (walletContext.account) {
        localStorage.setItem('walletAddress', walletContext.account);
        localStorage.setItem('walletConnected', 'true');
        if (walletContext.source) {
          localStorage.setItem('walletType', walletContext.source);
        }
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      
      toast({
        title: "Connection Error",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive"
      });
      
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [walletContext, walletModal, web3Modal, toast]);

  // Disconnect from wallet
  const disconnect = useCallback(() => {
    try {
      walletContext.disconnect();
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('walletConnected');
      localStorage.removeItem('walletType');
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected from VeCollab",
        duration: 3000
      });
    } catch (err) {
      console.error("Disconnect error:", err);
      toast({
        title: "Disconnect Error",
        description: "There was an error disconnecting your wallet",
        variant: "destructive"
      });
    }
  }, [walletContext, toast]);

  // Listen for connection changes
  useEffect(() => {
    const handleConnectionChange = (connected: string | null) => {
      if (connected) {
        localStorage.setItem('walletAddress', connected);
        localStorage.setItem('walletConnected', 'true');
        if (walletContext.source) {
          localStorage.setItem('walletType', walletContext.source);
        }
        
        toast({
          title: "Wallet Connected",
          description: `Connected to address: ${connected.substring(0, 6)}...${connected.substring(connected.length - 4)}`,
          duration: 3000
        });
      }
    };
    
    walletModal.onConnectionStatusChange(handleConnectionChange);
    
    return () => {
      // Cleanup any listeners if needed
    };
  }, [walletModal, walletContext.source, toast]);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect
  };
}